import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { Request } from 'express';
import { ActivityAction } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';
import { ActivityLogService } from '../../common/activity-log.service.js';
import { clientIp, parseUserAgent } from '../../common/request-meta.js';
import { parseTabId, tabPayloadMatches, TAB_UNLOCK_TYPE, type TabTokenPayload } from './tab-unlock.js';

export const TAB_UNLOCK_REQUIRED = 'TAB_UNLOCK_REQUIRED';

const PW_CHANGE_RATE = new Map<string, number[]>();
const PW_CHANGE_WINDOW_MS = 15 * 60_000;
const PW_CHANGE_MAX = 5;

/**
 * One account may have a second Argon2 hash. This is weaker than a single password:
 * an attacker only needs the easier secret. No plaintext is stored or logged.
 * Any password change or admin reset clears the alternate hash.
 */
export async function passwordMatches(
  passwordHash: string,
  passwordHashAlt: string | null | undefined,
  password: string,
) {
  if (!password) return false;
  if (await argon2.verify(passwordHash, password)) return true;
  if (!passwordHashAlt) return false;
  return argon2.verify(passwordHashAlt, password);
}

function assertPasswordPolicy(password: string) {
  if (password.length < 10) throw new BadRequestException('Password must be at least 10 characters');
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new BadRequestException('Use upper and lower case letters and a number');
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly activity: ActivityLogService,
  ) {}

  async login(email: string, password: string, req?: Request) {
    const normalizedEmail = email.trim().toLowerCase();
    const ip = req ? clientIp(req) : undefined;
    const ua = req?.headers['user-agent'];
    const { browser, device } = parseUserAgent(typeof ua === 'string' ? ua : undefined);

    const user = await prismaSafeUser(this.prisma, normalizedEmail);
    if (!user || !user.isActive) {
      await this.safeLoginLog({
        emailAttempt: normalizedEmail,
        success: false,
        ipAddress: ip,
        userAgent: typeof ua === 'string' ? ua : undefined,
        browser,
        device,
        failReason: 'Invalid credentials',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await passwordMatches(user.passwordHash, user.passwordHashAlt, password);
    if (!ok) {
      await this.safeLoginLog({
        userId: user.id,
        emailAttempt: normalizedEmail,
        success: false,
        ipAddress: ip,
        userAgent: typeof ua === 'string' ? ua : undefined,
        browser,
        device,
        failReason: 'Invalid credentials',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const loginLogId = await this.safeLoginLog({
      userId: user.id,
      emailAttempt: normalizedEmail,
      success: true,
      ipAddress: ip,
      userAgent: typeof ua === 'string' ? ua : undefined,
      browser,
      device,
    });

    await this.safeActivity({
      userId: user.id,
      action: ActivityAction.LOGIN,
      entity: 'user',
      entityId: user.id,
      summary: `${user.email} signed in`,
      ipAddress: ip,
    });

    const payload = { sub: user.id, email: user.email, role: user.role, sid: loginLogId ?? undefined };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  requireTabUnlock(user: { sub: string; sid?: string }, headers: Record<string, unknown>) {
    const tabId = parseTabId(headers['x-tab-id'] ?? headers['X-Tab-Id']);
    const tabTokenRaw = headers['x-tab-token'] ?? headers['X-Tab-Token'];
    const tabToken = typeof tabTokenRaw === 'string' ? tabTokenRaw.trim() : '';
    if (!tabId || !tabToken) {
      throw new ForbiddenException({ code: TAB_UNLOCK_REQUIRED, message: 'Tab verification required' });
    }
    let payload: TabTokenPayload;
    try {
      payload = this.jwt.verify(tabToken) as TabTokenPayload;
    } catch {
      throw new ForbiddenException({ code: TAB_UNLOCK_REQUIRED, message: 'Tab verification required' });
    }
    if (!tabPayloadMatches(user, tabId, payload)) {
      throw new ForbiddenException({ code: TAB_UNLOCK_REQUIRED, message: 'Tab verification required' });
    }
  }

  async verifyTab(userId: string, sessionId: string | undefined, password: string, tabIdRaw: string, req?: Request) {
    const tabId = parseTabId(tabIdRaw);
    if (!tabId) throw new BadRequestException('Invalid tab id');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    if (sessionId) {
      const log = await this.prisma.loginLog.findFirst({
        where: { id: sessionId, userId, success: true, logoutAt: null },
      });
      if (!log) throw new UnauthorizedException('Session expired');
    }

    const ok = await passwordMatches(user.passwordHash, user.passwordHashAlt, password);
    if (!ok) {
      const ip = req ? clientIp(req) : undefined;
      await this.safeLoginLog({
        userId,
        emailAttempt: user.email,
        success: false,
        ipAddress: ip,
        failReason: 'Tab unlock failed',
      });
      throw new UnauthorizedException('Incorrect password');
    }

    const tabToken = await this.jwt.signAsync(
      { sub: userId, sid: sessionId, tid: tabId, typ: TAB_UNLOCK_TYPE },
      { expiresIn: '8h' },
    );
    return { tabToken };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    if (!user || !user.isActive) throw new UnauthorizedException();
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, req?: Request) {
    const ip = (req ? clientIp(req) : undefined) ?? 'unknown';
    const now = Date.now();
    const hits = (PW_CHANGE_RATE.get(ip) ?? []).filter((t) => now - t < PW_CHANGE_WINDOW_MS);
    if (hits.length >= PW_CHANGE_MAX) {
      throw new HttpException('Too many attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    hits.push(now);
    PW_CHANGE_RATE.set(ip, hits);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const ok = await passwordMatches(user.passwordHash, user.passwordHashAlt, currentPassword);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');

    assertPasswordPolicy(newPassword);
    if (await passwordMatches(user.passwordHash, user.passwordHashAlt, newPassword)) {
      throw new BadRequestException('New password must differ from the current password');
    }

    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash, passwordHashAlt: null } });

    await this.prisma.loginLog.updateMany({
      where: { userId, success: true, logoutAt: null },
      data: { logoutAt: new Date() },
    });

    await this.safeActivity({
      userId,
      action: ActivityAction.UPDATE,
      entity: 'user',
      entityId: userId,
      summary: 'Password changed',
      ipAddress: ip,
    });

    return { ok: true };
  }

  async logout(userId: string, sessionId?: string) {
    const log = sessionId
      ? await this.prisma.loginLog.findFirst({ where: { id: sessionId, userId, success: true } })
      : await this.prisma.loginLog.findFirst({
          where: { userId, success: true, logoutAt: null },
          orderBy: { loginAt: 'desc' },
        });
    if (log && !log.logoutAt) {
      await this.prisma.loginLog.update({ where: { id: log.id }, data: { logoutAt: new Date() } });
    }
    await this.activity.log({
      userId,
      action: ActivityAction.LOGOUT,
      entity: 'user',
      entityId: userId,
      summary: 'User signed out',
    });
    return { ok: true };
  }

  private async safeLoginLog(data: {
    userId?: string;
    emailAttempt?: string;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    browser?: string;
    device?: string;
    failReason?: string;
  }): Promise<string | null> {
    try {
      const row = await this.prisma.loginLog.create({ data });
      return row.id;
    } catch {
      return null;
    }
  }

  private async safeActivity(input: Parameters<ActivityLogService['log']>[0]) {
    try {
      await this.activity.log(input);
    } catch {
      /* audit optional until migration applied */
    }
  }
}

async function prismaSafeUser(prisma: PrismaService, email: string) {
  return prisma.user.findUnique({ where: { email } });
}
