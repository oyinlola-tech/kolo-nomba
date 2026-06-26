-- Migration 0001: Initial schema
-- Migration 0002: Nomba Phase 18 payment infrastructure
-- Migration 0003: Convert all monetary Float columns to Integer (kobo)

-- 0001: Initial schema
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'GROUP_ADMIN', 'MEMBER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 0002: Nomba Phase 18

ALTER TABLE "payments" ADD CONSTRAINT "payments_provider_providerReference_key" UNIQUE ("provider", "providerReference");

ALTER TABLE "webhook_events"
  ADD COLUMN "eventId" TEXT,
  ADD COLUMN "signature" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "processedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "webhook_events_provider_eventId_key" ON "webhook_events"("provider", "eventId");

CREATE TABLE "virtual_accounts" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'nomba',
  "providerReference" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "bankName" TEXT NOT NULL,
  "ownerType" "OwnerType" NOT NULL,
  "ownerId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "virtual_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "virtual_accounts_providerReference_key" ON "virtual_accounts"("providerReference");
CREATE UNIQUE INDEX "virtual_accounts_accountNumber_key" ON "virtual_accounts"("accountNumber");
CREATE INDEX "virtual_accounts_ownerType_ownerId_idx" ON "virtual_accounts"("ownerType", "ownerId");

ALTER TYPE "PayoutStatus" ADD VALUE IF NOT EXISTS 'SUCCESSFUL';

-- 0003: Convert all monetary Float columns to Integer (kobo)
-- All amounts are stored as whole kobo (e.g. 150000 = ₦1500),
-- so ::integer cast is exact. If any fractional kobo values exist
-- in production data, audit before running.

ALTER TABLE "contribution_plans" ALTER COLUMN "amount" TYPE INTEGER USING "amount"::integer;
ALTER TABLE "contribution_cycles" ALTER COLUMN "expectedAmount" TYPE INTEGER USING "expectedAmount"::integer;
ALTER TABLE "contribution_cycles" ALTER COLUMN "receivedAmount" TYPE INTEGER USING "receivedAmount"::integer;
ALTER TABLE "member_contributions" ALTER COLUMN "expectedAmount" TYPE INTEGER USING "expectedAmount"::integer;
ALTER TABLE "member_contributions" ALTER COLUMN "paidAmount" TYPE INTEGER USING "paidAmount"::integer;
ALTER TABLE "payments" ALTER COLUMN "amount" TYPE INTEGER USING "amount"::integer;
ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE INTEGER USING "amount"::integer;
ALTER TABLE "wallets" ALTER COLUMN "balance" TYPE INTEGER USING "balance"::integer;
ALTER TABLE "ledger_entries" ALTER COLUMN "amount" TYPE INTEGER USING "amount"::integer;
ALTER TABLE "ledger_entries" ALTER COLUMN "balanceBefore" TYPE INTEGER USING "balanceBefore"::integer;
ALTER TABLE "ledger_entries" ALTER COLUMN "balanceAfter" TYPE INTEGER USING "balanceAfter"::integer;
ALTER TABLE "financial_transactions" ALTER COLUMN "amount" TYPE INTEGER USING "amount"::integer;
ALTER TABLE "reconciliation_records" ALTER COLUMN "amount" TYPE INTEGER USING "amount"::integer;
ALTER TABLE "reconciliation_records" ALTER COLUMN "difference" TYPE INTEGER USING "difference"::integer;
ALTER TABLE "payouts" ALTER COLUMN "amount" TYPE INTEGER USING "amount"::integer;
ALTER TABLE "payout_recipients" ALTER COLUMN "amount" TYPE INTEGER USING "amount"::integer;
ALTER TABLE "payout_schedules" ALTER COLUMN "amount" TYPE INTEGER USING "amount"::integer;
ALTER TABLE "withdrawal_requests" ALTER COLUMN "amount" TYPE INTEGER USING "amount"::integer;
