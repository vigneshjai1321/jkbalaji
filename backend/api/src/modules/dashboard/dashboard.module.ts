import { Module } from '@nestjs/common';

/**
 * Dashboard module - placeholder (no business logic yet).
 * Role-aware KPIs: plots available/booked/sold, today's collections, overdue dues, lead funnel.
 * Planned wiring: controllers/dashboard.controller.ts, services/dashboard.service.ts, repositories/dashboard.repository.ts
 */
@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class DashboardModule {}
