-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('FULL_TIME_CREATOR', 'STUDENT', 'PART_TIME_PLUS_CREATOR', 'EMPLOYED_PLUS_SIDE_HUSTLE');

-- CreateEnum
CREATE TYPE "EmergencyFundStatus" AS ENUM ('YES', 'NO', 'BUILDING');

-- CreateEnum
CREATE TYPE "DebtSituation" AS ENUM ('NONE', 'STUDENT_LOAN', 'CREDIT_CARD', 'INFORMAL_DEBT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "debtSituation" "DebtSituation",
ADD COLUMN     "employmentStatus" "EmploymentStatus",
ADD COLUMN     "hasEmergencyFund" "EmergencyFundStatus";
