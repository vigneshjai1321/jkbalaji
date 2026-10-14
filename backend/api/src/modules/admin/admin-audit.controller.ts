import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller({ path: 'admin/audit', version: '1' })
@UseGuards(JwtAuthGuard)
export class AdminAuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('login-logs')
  loginLogs(@Query('limit') limit?: string) {
    const take = Math.min(Number(limit) || 100, 500);
    return this.prisma.loginLog.findMany({
      take,
      orderBy: { loginAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
  }

  @Get('activity-logs')
  activityLogs(@Query('limit') limit?: string) {
    const take = Math.min(Number(limit) || 100, 500);
    return this.prisma.activityLog.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
  }
}
