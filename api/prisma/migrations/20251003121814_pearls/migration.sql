-- CreateEnum
CREATE TYPE "PearlSourceIdentifierType" AS ENUM ('ROR', 'GRID', 'RINGGOLD', 'ISNI', 'CROSSREF_FUNDER', 'WIKIDATA');

-- CreateEnum
CREATE TYPE "PearlCreatorType" AS ENUM ('INDIVIDUAL', 'ORGANISATION');

-- AlterEnum
ALTER TYPE "PublicationImportSource" ADD VALUE 'UKDS';

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "pearlId" TEXT;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "pearlId" TEXT;

-- CreateTable
CREATE TABLE "Pearl" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" "Languages" NOT NULL DEFAULT 'en',
    "licenceType" "LicenceType" NOT NULL DEFAULT 'CC_BY',
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pearl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PearlSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" "Languages" NOT NULL DEFAULT 'en',
    "licenceType" "LicenceType",
    "defaultTopicId" TEXT,
    "identifier" TEXT NOT NULL,
    "identifierType" "PearlSourceIdentifierType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PearlSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PearlCreator" (
    "id" TEXT NOT NULL,
    "pearlId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PearlCreatorType" NOT NULL,
    "creatorId" TEXT NOT NULL,
    "creatorTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PearlCreator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubPearl" (
    "id" TEXT NOT NULL,
    "doi" TEXT NOT NULL,
    "pearlId" TEXT,

    CONSTRAINT "SubPearl_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_pearlId_fkey" FOREIGN KEY ("pearlId") REFERENCES "Pearl"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_pearlId_fkey" FOREIGN KEY ("pearlId") REFERENCES "Pearl"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pearl" ADD CONSTRAINT "Pearl_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "PearlSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PearlSource" ADD CONSTRAINT "PearlSource_defaultTopicId_fkey" FOREIGN KEY ("defaultTopicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PearlCreator" ADD CONSTRAINT "PearlCreator_pearlId_fkey" FOREIGN KEY ("pearlId") REFERENCES "Pearl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubPearl" ADD CONSTRAINT "SubPearl_pearlId_fkey" FOREIGN KEY ("pearlId") REFERENCES "Pearl"("id") ON DELETE SET NULL ON UPDATE CASCADE;
