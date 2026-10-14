-- Invoice management v2 (additive; preserves existing invoice rows)

CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');
CREATE TYPE "TaxMode" AS ENUM ('CGST_SGST', 'IGST');

ALTER TABLE "invoices" ADD COLUMN "status" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID';
ALTER TABLE "invoices" ADD COLUMN "due_date" DATE;
ALTER TABLE "invoices" ADD COLUMN "payment_terms" TEXT;
ALTER TABLE "invoices" ADD COLUMN "discount_inr" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoices" ADD COLUMN "igst_inr" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoices" ADD COLUMN "amount_paid_inr" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoices" ADD COLUMN "tax_mode" "TaxMode" NOT NULL DEFAULT 'CGST_SGST';
ALTER TABLE "invoices" ADD COLUMN "place_of_supply" TEXT;
ALTER TABLE "invoices" ADD COLUMN "issued_at" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN "cancelled_at" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN "cancel_reason" TEXT;
ALTER TABLE "invoices" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "invoice_lines" ADD COLUMN "hsn_sac" TEXT;
ALTER TABLE "invoice_lines" ADD COLUMN "discount_inr" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoice_lines" ADD COLUMN "gst_rate_pct" DECIMAL(5,2) NOT NULL DEFAULT 3;
ALTER TABLE "invoice_lines" ADD COLUMN "taxable_inr" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoice_lines" ADD COLUMN "cgst_inr" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoice_lines" ADD COLUMN "sgst_inr" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoice_lines" ADD COLUMN "igst_inr" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoice_lines" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "invoice_payments" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount_inr" DECIMAL(14,2) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT,
    "reference" TEXT,
    "recorded_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoice_events" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoice_sequences" (
    "id" TEXT NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "last_number" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invoice_sequences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invoice_sequences_fiscal_year_key" ON "invoice_sequences"("fiscal_year");

ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoice_events" ADD CONSTRAINT "invoice_events_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "invoices_status_invoice_date_idx" ON "invoices"("status", "invoice_date" DESC);
CREATE INDEX "invoice_events_invoice_id_idx" ON "invoice_events"("invoice_id", "created_at" DESC);

-- Treat historical issued invoices as fully paid (no payment rows existed before)
UPDATE "invoices" SET "status" = 'PAID', "amount_paid_inr" = "total_inr", "issued_at" = COALESCE("issued_at", "created_at") WHERE "status" = 'UNPAID';

UPDATE "invoice_lines" SET "taxable_inr" = "amount_inr", "cgst_inr" = 0, "sgst_inr" = 0 WHERE "taxable_inr" = 0;
