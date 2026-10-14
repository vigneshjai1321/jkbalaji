-- GoldAPI market benchmark storage (non-destructive; existing gold_rates unchanged)

CREATE TYPE "MetalSymbol" AS ENUM ('XAU', 'XAG');

CREATE TABLE "metal_market_rates" (
    "id" TEXT NOT NULL,
    "metal" "MetalSymbol" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "unit" TEXT NOT NULL DEFAULT 'gram',
    "price_per_gram" DECIMAL(12,4) NOT NULL,
    "price_22k_per_gram" DECIMAL(12,4),
    "price_18k_per_gram" DECIMAL(12,4),
    "provider" TEXT NOT NULL DEFAULT 'goldapi.io',
    "source_timestamp" TIMESTAMP(3),
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_price_troy_oz" DECIMAL(14,4),
    "fetch_batch_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metal_market_rates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "metal_market_rates_metal_fetched_at_idx" ON "metal_market_rates"("metal", "fetched_at" DESC);

CREATE TABLE "gold_api_daily_fetches" (
    "id" TEXT NOT NULL,
    "fetch_date" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "fetch_batch_id" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gold_api_daily_fetches_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gold_api_daily_fetches_fetch_date_key" ON "gold_api_daily_fetches"("fetch_date");

CREATE TABLE "gold_api_usage_months" (
    "id" TEXT NOT NULL,
    "year_month" TEXT NOT NULL,
    "request_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gold_api_usage_months_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gold_api_usage_months_year_month_key" ON "gold_api_usage_months"("year_month");
