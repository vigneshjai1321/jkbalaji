CREATE TYPE "ProjectLifecycle" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "PropertyKind" AS ENUM ('RESIDENTIAL_PLOT', 'CORNER_PLOT', 'VILLA', 'INDEPENDENT_HOUSE', 'FARMLAND', 'PLOT_WITH_HOUSE', 'OTHER');
CREATE TYPE "AreaUnit" AS ENUM ('SQFT', 'SQYD', 'SQM', 'ACRE', 'CENT');
CREATE TYPE "CommissionKind" AS ENUM ('PERCENTAGE', 'FIXED');
CREATE TYPE "CommissionPayStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID');

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "lifecycle" "ProjectLifecycle" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "notes" TEXT;

ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "kind" "PropertyKind" NOT NULL DEFAULT 'RESIDENTIAL_PLOT';
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "area_unit" "AreaUnit" NOT NULL DEFAULT 'SQFT';
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "land_area" DECIMAL(14,4);
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "built_up_sqft" DECIMAL(12,2);
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "carpet_sqft" DECIMAL(12,2);
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "properties" ALTER COLUMN "published" SET DEFAULT false;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "broker_id" TEXT;
ALTER TABLE "properties" ALTER COLUMN "area_sqft" TYPE DECIMAL(14,2);

UPDATE "properties"
SET "land_area" = "area_sqft"
WHERE "area_sqft" IS NOT NULL AND "land_area" IS NULL;

CREATE INDEX IF NOT EXISTS "properties_status_idx" ON "properties"("status");
CREATE INDEX IF NOT EXISTS "properties_project_id_idx" ON "properties"("project_id");

CREATE TABLE IF NOT EXISTS "brokers" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "brokers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "commissions" (
  "id" TEXT NOT NULL,
  "broker_id" TEXT NOT NULL,
  "property_id" TEXT,
  "project_id" TEXT,
  "kind" "CommissionKind" NOT NULL,
  "rate" DECIMAL(14,2) NOT NULL,
  "sale_value_inr" DECIMAL(14,2),
  "expected_inr" DECIMAL(14,2) NOT NULL,
  "paid_inr" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" "CommissionPayStatus" NOT NULL DEFAULT 'PENDING',
  "paid_on" DATE,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "commissions_broker_id_idx" ON "commissions"("broker_id");
CREATE INDEX IF NOT EXISTS "commissions_status_idx" ON "commissions"("status");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'properties_broker_id_fkey') THEN
    ALTER TABLE "properties" ADD CONSTRAINT "properties_broker_id_fkey"
      FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_broker_id_fkey') THEN
    ALTER TABLE "commissions" ADD CONSTRAINT "commissions_broker_id_fkey"
      FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_property_id_fkey') THEN
    ALTER TABLE "commissions" ADD CONSTRAINT "commissions_property_id_fkey"
      FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_project_id_fkey') THEN
    ALTER TABLE "commissions" ADD CONSTRAINT "commissions_project_id_fkey"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
