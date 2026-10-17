import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../generated/prisma/client.js';
import type { PrismaService } from '../../database/prisma.service.js';

const SCOPED_MANAGER_ROLES = new Set<UserRole>([UserRole.REAL_ESTATE_MANAGER, UserRole.GOLD_MANAGER]);

export function isScopedManagerRole(role: UserRole | string | undefined): boolean {
  return role != null && SCOPED_MANAGER_ROLES.has(role as UserRole);
}

export function assertManagerMayChangeOwnPassword(role: UserRole | string | undefined): void {
  if (isScopedManagerRole(role)) {
    throw new ForbiddenException('Password changes are managed by your super administrator');
  }
}

export async function resolveUserByLogin(prisma: PrismaService, loginRaw: string) {
  const login = loginRaw.trim().toLowerCase();
  if (!login) return null;

  if (login.includes('@')) {
    return prisma.user.findUnique({ where: { email: login } });
  }

  const byLoginId = await prisma.user.findFirst({ where: { loginId: login } });
  if (byLoginId) return byLoginId;

  return prisma.user.findUnique({ where: { email: login } });
}
