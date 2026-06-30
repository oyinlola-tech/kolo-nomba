-- Migration 0004: Add Dispute model for admin dispute management

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "DisputeSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('PAYMENT_FAILURE', 'MISSING_CONTRIBUTION', 'INCORRECT_AMOUNT', 'DUPLICATE_PAYMENT', 'UNAUTHORIZED_TRANSACTION', 'WITHDRAWAL_ISSUE', 'PAYOUT_ISSUE', 'OTHER');

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "groupId" TEXT,
    "type" "DisputeType" NOT NULL,
    "severity" "DisputeSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "amount" INTEGER,
    "metadata" JSONB,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "disputes_userId_idx" ON "disputes"("userId");

-- CreateIndex
CREATE INDEX "disputes_groupId_idx" ON "disputes"("groupId");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "disputes_type_idx" ON "disputes"("type");

-- CreateIndex
CREATE INDEX "disputes_createdAt_idx" ON "disputes"("createdAt");

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
