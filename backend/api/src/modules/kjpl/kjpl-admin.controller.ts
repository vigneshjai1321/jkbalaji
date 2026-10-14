import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../../generated/prisma/client.js';
import { KjplService } from './kjpl.service.js';

@Controller({ path: 'admin/kjpl-rates', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.GOLD_MANAGER)
export class KjplAdminController {
  constructor(private readonly kjpl: KjplService) {}

  @Get('status')
  async status() {
    const cache = await this.kjpl.readCache();
    return {
      enabled: this.kjpl.isEnabled(),
      pollIntervalMinutes: this.kjpl.pollIntervalMinutes(),
      cache: cache
        ? {
            fetchedAt: cache.fetchedAt,
            sourceUrl: cache.sourceUrl,
            rates: cache.rates,
          }
        : null,
    };
  }

  @Post('refresh')
  refresh() {
    return this.kjpl.refreshRates();
  }
}
