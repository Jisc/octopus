/*
  Warnings:

  - Added the required column `slug` to the `PearlSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `SubPearl` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `SubPearl` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `SubPearl` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pearl" ADD COLUMN     "doi" TEXT,
ADD COLUMN     "externalId" TEXT;

-- AlterTable
ALTER TABLE "PearlCreator" ALTER COLUMN "type" SET DEFAULT 'INDIVIDUAL';

-- AlterTable
ALTER TABLE "PearlSource" ADD COLUMN     "slug" "PublicationImportSource" NOT NULL;

-- AlterTable
ALTER TABLE "SubPearl" ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" "PublicationType" NOT NULL;
