/*
  Warnings:

  - You are about to drop the `SubPearl` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SubPearl" DROP CONSTRAINT "SubPearl_pearlId_fkey";

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "pearlId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSystemAccount" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "SubPearl";

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_pearlId_fkey" FOREIGN KEY ("pearlId") REFERENCES "Pearl"("id") ON DELETE CASCADE ON UPDATE CASCADE;
