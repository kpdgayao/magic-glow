-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastCheckIn" TIMESTAMP(3),
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "streakCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DailyAdvice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyAdvice_userId_date_idx" ON "DailyAdvice"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAdvice_userId_date_key" ON "DailyAdvice"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyAdvice" ADD CONSTRAINT "DailyAdvice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
