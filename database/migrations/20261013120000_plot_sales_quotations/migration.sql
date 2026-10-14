-- Plot pricing & sales quotations
CREATE TYPE "PlotQuotationStatus" AS ENUM ('DRAFT', 'QUOTED', 'RESERVATION', 'VOID');
CREATE TYPE "PlotChargeKind" AS ENUM ('FIXED', 'PERCENT');
CREATE TYPE "PlotChargeBase" AS ENUM ('BASE_PLOT');
CREATE TYPE "CommissionPaidBy" AS ENUM ('SELLER', 'BUYER');

ALTER TABLE "plots" ADD COLUMN IF NOT EXISTS "price_per_sqft_inr" DECIMAL(14,2);
ALTER TABLE "plots" ADD COLUMN IF NOT EXISTS "broker_id" TEXT;
CREATE INDEX IF NOT EXISTS "plots_broker_id_idx" ON "plots"("broker_id");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plots_broker_id_fkey') THEN
    ALTER TABLE "plots" ADD CONSTRAINT "plots_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "commissions" ADD COLUMN IF NOT EXISTS "plot_id" TEXT;
ALTER TABLE "commissions" ADD COLUMN IF NOT EXISTS "plot_quotation_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "commissions_plot_quotation_id_key" ON "commissions"("plot_quotation_id");
CREATE INDEX IF NOT EXISTS "commissions_plot_id_idx" ON "commissions"("plot_id");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_plot_id_fkey') THEN
    ALTER TABLE "commissions" ADD CONSTRAINT "commissions_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "plot_import_reviews" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "supplied_plot_number" TEXT NOT NULL,
    "area_sqft" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "source_note" TEXT,
    "resolved_plot_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plot_import_reviews_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "plot_import_reviews_project_id_idx" ON "plot_import_reviews"("project_id");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plot_import_reviews_project_id_fkey') THEN
    ALTER TABLE "plot_import_reviews" ADD CONSTRAINT "plot_import_reviews_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "plot_quotations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "plot_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "status" "PlotQuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "price_per_sqft_inr" DECIMAL(14,2) NOT NULL,
    "base_plot_price_inr" DECIMAL(14,2) NOT NULL,
    "additional_total_inr" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "estimated_total_inr" DECIMAL(14,2) NOT NULL,
    "include_commission_in_total" BOOLEAN NOT NULL DEFAULT false,
    "broker_id" TEXT,
    "commission_kind" "CommissionKind",
    "commission_rate" DECIMAL(14,2),
    "commission_base" "PlotChargeBase" DEFAULT 'BASE_PLOT',
    "commission_expected_inr" DECIMAL(14,2),
    "commission_paid_by" "CommissionPaidBy" DEFAULT 'SELLER',
    "valid_until" DATE,
    "notes" TEXT,
    "terms" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "plot_quotations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "plot_quotations_project_id_idx" ON "plot_quotations"("project_id");
CREATE INDEX IF NOT EXISTS "plot_quotations_plot_id_idx" ON "plot_quotations"("plot_id");
CREATE INDEX IF NOT EXISTS "plot_quotations_customer_id_idx" ON "plot_quotations"("customer_id");
CREATE INDEX IF NOT EXISTS "plot_quotations_status_idx" ON "plot_quotations"("status");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plot_quotations_project_id_fkey') THEN
    ALTER TABLE "plot_quotations" ADD CONSTRAINT "plot_quotations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plot_quotations_plot_id_fkey') THEN
    ALTER TABLE "plot_quotations" ADD CONSTRAINT "plot_quotations_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plot_quotations_customer_id_fkey') THEN
    ALTER TABLE "plot_quotations" ADD CONSTRAINT "plot_quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plot_quotations_broker_id_fkey') THEN
    ALTER TABLE "plot_quotations" ADD CONSTRAINT "plot_quotations_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "plot_quotation_charges" (
    "id" TEXT NOT NULL,
    "quotation_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "PlotChargeKind" NOT NULL,
    "fixed_amount_inr" DECIMAL(14,2),
    "percent_rate" DECIMAL(8,4),
    "percent_base" "PlotChargeBase",
    "amount_inr" DECIMAL(14,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "plot_quotation_charges_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "plot_quotation_charges_quotation_id_idx" ON "plot_quotation_charges"("quotation_id");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plot_quotation_charges_quotation_id_fkey') THEN
    ALTER TABLE "plot_quotation_charges" ADD CONSTRAINT "plot_quotation_charges_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "plot_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_plot_quotation_id_fkey') THEN
    ALTER TABLE "commissions" ADD CONSTRAINT "commissions_plot_quotation_id_fkey" FOREIGN KEY ("plot_quotation_id") REFERENCES "plot_quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "plot_events" (
    "id" TEXT NOT NULL,
    "plot_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plot_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "plot_events_plot_id_idx" ON "plot_events"("plot_id");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plot_events_plot_id_fkey') THEN
    ALTER TABLE "plot_events" ADD CONSTRAINT "plot_events_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
