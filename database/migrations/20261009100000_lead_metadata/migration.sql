-- Lead enquiry metadata (optional fields; preserve existing rows)
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "lead_type" TEXT;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "source_page" TEXT;

CREATE INDEX IF NOT EXISTS "leads_site_status_created_at_idx" ON "leads" ("site", "status", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads" ("created_at" DESC);
