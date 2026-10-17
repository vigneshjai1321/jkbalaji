import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import * as argon2 from 'argon2';
import { UserRole } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';

@Controller({ path: 'admin/users', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        loginId: true,
        name: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  @Post()
  async create(
    @Req() req: Request & { user?: { role: UserRole } },
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
      role: UserRole;
      department?: string;
      phone?: string;
    },
  ) {
    if (body.role === UserRole.SUPER_ADMIN && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only a super administrator can assign the super admin role');
    }
    const passwordHash = await argon2.hash(body.password);
    return this.prisma.user.create({
      data: {
        email: body.email.trim().toLowerCase(),
        passwordHash,
        name: body.name,
        role: body.role,
        department: body.department,
        phone: body.phone,
      },
      select: { id: true, email: true, name: true, role: true, department: true, isActive: true },
    });
  }

  @Patch(':id')
  update(
    @Req() req: Request & { user?: { sub: string; role: UserRole } },
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      role?: UserRole;
      department?: string;
      phone?: string;
      isActive?: boolean;
      email?: string;
      loginId?: string;
    },
  ) {
    if (body.role === UserRole.SUPER_ADMIN && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only a super administrator can assign the super admin role');
    }
    if (id === req.user?.sub) {
      if (body.role != null || body.isActive === false || body.email != null || body.loginId != null) {
        throw new ForbiddenException('You cannot change your own role, sign-in, or access level');
      }
    }
    const { email: _e, loginId: _l, ...data } = body;
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, loginId: true, name: true, role: true, department: true, isActive: true },
    });
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string, @Body() body: { password: string }) {
    const passwordHash = await argon2.hash(body.password);
    await this.prisma.user.update({ where: { id }, data: { passwordHash, passwordHashAlt: null } });
    return { ok: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return { ok: true };
  }
}
