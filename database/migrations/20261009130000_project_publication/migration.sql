-- Distinct project status values and publication fields.
-- Existing rows stay published so the current public catalogue does not disappear.
ALTER TYPE "ProjectPhase" ADD VALUE IF NOT EXISTS 'ALMOST_COMPLETED';
ALTER TYPE "ProjectPhase" ADD VALUE IF NOT EXISTS 'YET_TO_BE_ANNOUNCED';

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "phase_label" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "cover_image" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "projects" ALTER COLUMN "published" SET DEFAULT false;

CREATE INDEX IF NOT EXISTS "projects_published_idx" ON "projects"("published");

ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "project_id" TEXT;
CREATE INDEX IF NOT EXISTS "leads_project_id_idx" ON "leads"("project_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_project_id_fkey'
  ) THEN
    ALTER TABLE "leads"
      ADD CONSTRAINT "leads_project_id_fkey"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
