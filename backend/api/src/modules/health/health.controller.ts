import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      project: 'JK Balaji',
      server: 'jkbalaji.vps',
      timestamp: new Date().toISOString(),
    };
  }
}
