-- CreateEnum
CREATE TYPE "PlotStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'BLOCKED');
CREATE TYPE "ExpenseCategory" AS ENUM ('SALARY', 'RENT', 'ELECTRICITY', 'INTERNET', 'MARKETING', 'FUEL', 'TRAVEL', 'OFFICE', 'MISCELLANEOUS');
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE');

-- AlterTable
ALTER TABLE "jewellery_products" ADD COLUMN IF NOT EXISTS "product_code" TEXT;
ALTER TABLE "jewellery_products" ADD COLUMN IF NOT EXISTS "purity" TEXT;

-- CreateTable
CREATE TABLE "plots" (
    "id" TEXT NOT NULL,
    "plot_number" TEXT NOT NULL,
    "survey_number" TEXT,
    "project_id" TEXT,
    "area_sqft" DECIMAL(12,2),
    "facing" TEXT,
    "status" "PlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "customer_id" TEXT,
    "price_inr" DECIMAL(14,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount_inr" DECIMAL(14,2) NOT NULL,
    "description" TEXT,
    "expense_date" DATE NOT NULL,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "entry_date" DATE NOT NULL,
    "narration" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "journal_lines" (
    "id" TEXT NOT NULL,
    "journal_entry_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "debit_inr" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "credit_inr" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "journal_lines_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "accounts_code_key" ON "accounts"("code");
CREATE INDEX "plots_status_idx" ON "plots"("status");
CREATE INDEX "plots_project_id_idx" ON "plots"("project_id");
CREATE INDEX "expenses_expense_date_idx" ON "expenses"("expense_date");
CREATE INDEX "expenses_category_idx" ON "expenses"("category");
CREATE INDEX "journal_entries_entry_date_idx" ON "journal_entries"("entry_date");

ALTER TABLE "plots" ADD CONSTRAINT "plots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "plots" ADD CONSTRAINT "plots_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
