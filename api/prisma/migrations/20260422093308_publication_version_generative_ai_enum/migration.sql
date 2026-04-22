/*
  Warnings:

  - The `generativeAIUsage` column on the `PublicationVersion` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "GenerativeAIUsageEnum" AS ENUM ('YES', 'NO', 'UNSURE');

-- AlterTable
ALTER TABLE "PublicationVersion" DROP COLUMN "generativeAIUsage",
ADD COLUMN     "generativeAIUsage" "GenerativeAIUsageEnum";
