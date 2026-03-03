/*
  Warnings:

  - You are about to drop the column `pearlId` on the `Topic` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_pearlId_fkey";

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "pearlId";

-- CreateTable
CREATE TABLE "_PearlToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PearlToTopic_AB_unique" ON "_PearlToTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_PearlToTopic_B_index" ON "_PearlToTopic"("B");

-- AddForeignKey
ALTER TABLE "_PearlToTopic" ADD CONSTRAINT "_PearlToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "Pearl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PearlToTopic" ADD CONSTRAINT "_PearlToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
