import { Module } from '@nestjs/common';
import { LeadNotifyService } from '../../common/lead-notify.service.js';
import { ProjectCatalogService } from '../admin/project-catalog.service.js';
import { MarketRatesModule } from '../market-rates/market-rates.module.js';
import { PublicController } from './public.controller.js';

@Module({
  imports: [MarketRatesModule],
  controllers: [PublicController],
  providers: [LeadNotifyService, ProjectCatalogService],
})
export class PublicModule {}
