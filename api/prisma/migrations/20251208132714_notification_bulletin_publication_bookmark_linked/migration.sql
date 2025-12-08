-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationActionTypeEnum" ADD VALUE 'PUBLICATION_BOOKMARK_VERSION_LINKED_SUCCESSOR';
ALTER TYPE "NotificationActionTypeEnum" ADD VALUE 'PUBLICATION_BOOKMARK_PEER_REVIEWED';

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "enableBookmarkLinkedNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableBookmarkPeerReviewNotifications" BOOLEAN NOT NULL DEFAULT true;
