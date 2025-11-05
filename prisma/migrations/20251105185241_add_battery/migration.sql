-- AlterTable
ALTER TABLE "CleanLog" ADD COLUMN     "batteryAfter" INTEGER,
ADD COLUMN     "batteryBefore" INTEGER;

-- CreateIndex
CREATE INDEX "User_isPremium_idx" ON "User"("isPremium");
