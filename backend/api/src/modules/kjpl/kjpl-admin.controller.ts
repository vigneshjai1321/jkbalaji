import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { JewelleryUnit } from '../auth/business-unit.decorator.js';
import { BusinessUnitGuard } from '../auth/business-unit.guard.js';
import { UserRole } from '../../generated/prisma/client.js';
import { KjplService } from './kjpl.service.js';

@Controller({ path: 'admin/kjpl-rates', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard, BusinessUnitGuard)
@JewelleryUnit()
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.GOLD_MANAGER)
export class KjplAdminController {
  constructor(private readonly kjpl: KjplService) {}

  @Get('status')
  status() {
    return this.kjpl.getAdminOperationalStatus();
  }

  @Post('refresh')
  refresh() {
    return this.kjpl.refreshRates();
  }
}
