ALTER TABLE "plots" ADD COLUMN IF NOT EXISTS "length_ft" DECIMAL(10,2);
ALTER TABLE "plots" ADD COLUMN IF NOT EXISTS "width_ft" DECIMAL(10,2);
ALTER TABLE "plots" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "plots" ADD COLUMN IF NOT EXISTS "archived" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "plots_archived_idx" ON "plots"("archived");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plots_project_id_plot_number_key') THEN
    ALTER TABLE "plots" ADD CONSTRAINT "plots_project_id_plot_number_key" UNIQUE ("project_id", "plot_number");
  END IF;
EXCEPTION
  WHEN unique_violation THEN NULL;
END $$;
