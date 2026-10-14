import { Module } from '@nestjs/common';

/**
 * Collections module - placeholder (no business logic yet).
 * Receipts against bookings: cash/cheque/UPI/NEFT, receipt numbering, cheque clearance, dues/overdues, idempotent posting.
 * Planned wiring: controllers/collections.controller.ts, services/collections.service.ts, repositories/collections.repository.ts
 */
@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class CollectionsModule {}
