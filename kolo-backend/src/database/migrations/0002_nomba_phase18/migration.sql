-- Nomba Phase 18 payment infrastructure

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
