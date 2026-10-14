import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { PublicModule } from './modules/public/public.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { BillingModule } from './modules/billing/billing.module.js';
import { GoldApiModule } from './modules/goldapi/goldapi.module.js';
import { KjplModule } from './modules/kjpl/kjpl.module.js';
import { MarketRatesModule } from './modules/market-rates/market-rates.module.js';
import { MailModule } from './modules/mail/mail.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MailModule,
    GoldApiModule,
    KjplModule,
    MarketRatesModule,
    AuthModule,
    HealthModule,
    PublicModule,
    AdminModule,
    BillingModule,
  ],
})
export class AppModule {}
