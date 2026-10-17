import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '../../generated/prisma/client.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { JewelleryUnit } from '../auth/business-unit.decorator.js';
import { BusinessUnitGuard } from '../auth/business-unit.guard.js';
import { GoldApiService } from './goldapi.service.js';

@Controller({ path: 'admin/goldapi', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard, BusinessUnitGuard)
@JewelleryUnit()
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.GOLD_MANAGER)
export class GoldApiAdminController {
  constructor(private readonly goldApi: GoldApiService) {}

  @Get('status')
  async status() {
    const [market, usage] = await Promise.all([
      this.goldApi.getPublicMarketRates(),
      this.goldApi.getUsage(),
    ]);
    return {
      configured: this.goldApi.isConfigured(),
      schedulerEnabled: this.goldApi.isSchedulerEnabled(),
      market,
      usage,
    };
  }

  @Post('verify')
  verify() {
    return this.goldApi.verifySubscriptionEndpoints();
  }

  @Post('sync')
  sync() {
    return this.goldApi.runDailyFetch('manual');
  }
}
