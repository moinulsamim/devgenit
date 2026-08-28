-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- CreateTable
CREATE TABLE "PaymentClaim" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "claimedAmount" DECIMAL(10,2) NOT NULL,
    "claimedForDate" TIMESTAMP(3),
    "note" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,

    CONSTRAINT "PaymentClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentClaim_serviceId_idx" ON "PaymentClaim"("serviceId");

-- CreateIndex
CREATE INDEX "PaymentClaim_status_idx" ON "PaymentClaim"("status");

-- AddForeignKey
ALTER TABLE "PaymentClaim" ADD CONSTRAINT "PaymentClaim_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
