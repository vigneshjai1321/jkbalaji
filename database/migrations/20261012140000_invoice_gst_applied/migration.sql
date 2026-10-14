-- Optional GST per invoice + line unit (preserves existing rows)

ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "gst_applied" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "invoice_lines" ADD COLUMN IF NOT EXISTS "unit" TEXT NOT NULL DEFAULT 'nos';

-- Legacy rows with zero tax may have been non-GST bills; leave gst_applied true if any tax was recorded
UPDATE "invoices"
SET "gst_applied" = false
WHERE "cgst_inr" = 0 AND "sgst_inr" = 0 AND "igst_inr" = 0
  AND "subtotal_inr" = "total_inr"
  AND "status" != 'CANCELLED';
