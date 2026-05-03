-- AlterTable: add auth and notification fields to User
ALTER TABLE "User" ADD COLUMN "appleId" TEXT;
ALTER TABLE "User" ADD COLUMN "fcmToken" TEXT;
ALTER TABLE "User" ADD COLUMN "notificationThreshold" INTEGER NOT NULL DEFAULT 70;

-- AlterTable: remove score from Condition (score is user-dependent, computed dynamically)
ALTER TABLE "Condition" DROP COLUMN "score";

-- CreateIndex
CREATE UNIQUE INDEX "User_appleId_key" ON "User"("appleId");

-- CreateIndex
CREATE INDEX "Condition_spotId_fetchedAt_idx" ON "Condition"("spotId", "fetchedAt");
