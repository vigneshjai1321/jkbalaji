-- Broker commission management: settings overrides, payment ledger, snapshots

CREATE TYPE "CommissionRateSource" AS ENUM ('GLOBAL', 'BROKER', 'PROJECT', 'MANUAL');
CREATE TYPE "CommissionSettingsScope" AS ENUM ('GLOBAL', 'BROKER', 'PROJECT');

ALTER TABLE "brokers" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "brokers" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "brokers" ADD COLUMN IF NOT EXISTS "commission_kind" "CommissionKind";
ALTER TABLE "brokers" ADD COLUMN IF NOT EXISTS "commission_rate" DECIMAL(14,2);

CREATE UNIQUE INDEX IF NOT EXISTS "brokers_code_key" ON "brokers"("code") WHERE "code" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "brokers_phone_idx" ON "brokers"("phone");

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "commission_kind" "CommissionKind";
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "commission_rate" DECIMAL(14,2);

ALTER TABLE "commissions" ADD COLUMN IF NOT EXISTS "rate_source" "CommissionRateSource" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "commissions" ADD COLUMN IF NOT EXISTS "calculation_basis" TEXT NOT NULL DEFAULT 'BASE_PLOT';
ALTER TABLE "commissions" ADD COLUMN IF NOT EXISTS "voided" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "commissions" ADD COLUMN IF NOT EXISTS "needs_review" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "commissions_project_id_idx" ON "commissions"("project_id");
CREATE INDEX IF NOT EXISTS "commissions_created_at_idx" ON "commissions"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "commissions_plot_id_idx" ON "commissions"("plot_id");

CREATE TABLE IF NOT EXISTS "commission_payments" (
    "id" TEXT NOT NULL,
    "commission_id" TEXT NOT NULL,
    "amount_inr" DECIMAL(14,2) NOT NULL,
    "paid_at" DATE NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "recorded_by_id" TEXT,
    "reversed_at" TIMESTAMP(3),
    "reversal_of_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "commission_payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "commission_payments_reversal_of_id_key" ON "commission_payments"("reversal_of_id");
CREATE INDEX IF NOT EXISTS "commission_payments_commission_id_paid_at_idx" ON "commission_payments"("commission_id", "paid_at" DESC);

ALTER TABLE "commission_payments" ADD CONSTRAINT "commission_payments_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "commission_payments" ADD CONSTRAINT "commission_payments_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "commission_payments" ADD CONSTRAINT "commission_payments_reversal_of_id_fkey" FOREIGN KEY ("reversal_of_id") REFERENCES "commission_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "commission_settings_audit" (
    "id" TEXT NOT NULL,
    "scope" "CommissionSettingsScope" NOT NULL,
    "entity_id" TEXT,
    "kind" "CommissionKind" NOT NULL,
    "rate" DECIMAL(14,2) NOT NULL,
    "previous_kind" "CommissionKind",
    "previous_rate" DECIMAL(14,2),
    "changed_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "commission_settings_audit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "commission_settings_audit_scope_created_at_idx" ON "commission_settings_audit"("scope", "created_at" DESC);
ALTER TABLE "commission_settings_audit" ADD CONSTRAINT "commission_settings_audit_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
