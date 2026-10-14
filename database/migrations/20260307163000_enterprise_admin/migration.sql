-- Enterprise admin: audit, CRM extensions, projects, notifications

-- UserRole enum extensions
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'REAL_ESTATE_MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SALES_MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CRM_EXECUTIVE';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'GOLD_MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'BILLING_STAFF';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ACCOUNTANT';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EMPLOYEE';

-- LeadStatus extensions
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'INTERESTED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'NEGOTIATION';

CREATE TYPE "ProjectPhase" AS ENUM ('ONGOING', 'COMPLETED', 'UPCOMING');
CREATE TYPE "ActivityAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);

ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'WEBSITE';
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "assigned_to_id" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "created_by_id" TEXT;

CREATE TABLE IF NOT EXISTS "login_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email_attempt" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "browser" TEXT,
    "device" TEXT,
    "location" TEXT,
    "fail_reason" TEXT,
    "login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logout_at" TIMESTAMP(3),
    CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "ActivityAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "app_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "location" TEXT,
    "phase" "ProjectPhase" NOT NULL DEFAULT 'ONGOING',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "projects_slug_key" ON "projects"("slug");

ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "project_id" TEXT;

CREATE TABLE IF NOT EXISTS "lead_notes" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lead_followups" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,
    "due_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_followups_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "login_logs_user_id_login_at_idx" ON "login_logs"("user_id", "login_at");
CREATE INDEX IF NOT EXISTS "activity_logs_entity_entity_id_idx" ON "activity_logs"("entity", "entity_id");
CREATE INDEX IF NOT EXISTS "activity_logs_created_at_idx" ON "activity_logs"("created_at");
CREATE INDEX IF NOT EXISTS "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");
CREATE INDEX IF NOT EXISTS "lead_followups_due_at_completed_at_idx" ON "lead_followups"("due_at", "completed_at");
CREATE UNIQUE INDEX IF NOT EXISTS "app_settings_key_key" ON "app_settings"("key");

ALTER TABLE "login_logs" DROP CONSTRAINT IF EXISTS "login_logs_user_id_fkey";
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_user_id_fkey";
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_project_id_fkey";
ALTER TABLE "properties" ADD CONSTRAINT "properties_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_assigned_to_id_fkey";
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "lead_notes" DROP CONSTRAINT IF EXISTS "lead_notes_lead_id_fkey";
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_notes" DROP CONSTRAINT IF EXISTS "lead_notes_created_by_id_fkey";
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "lead_followups" DROP CONSTRAINT IF EXISTS "lead_followups_lead_id_fkey";
ALTER TABLE "lead_followups" ADD CONSTRAINT "lead_followups_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_followups" DROP CONSTRAINT IF EXISTS "lead_followups_assigned_to_id_fkey";
ALTER TABLE "lead_followups" ADD CONSTRAINT "lead_followups_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "leads" SET "status" = 'INTERESTED' WHERE "status" = 'QUALIFIED';
