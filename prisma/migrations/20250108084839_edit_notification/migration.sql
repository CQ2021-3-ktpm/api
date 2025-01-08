/*
  Warnings:

  - The values [SENT] on the enum `NotificationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `event_id` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `message_type` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `player_id` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `campaign_id` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CAMPAIGN_START_24H', 'CAMPAIGN_START_30MIN');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationStatus_new" AS ENUM ('READ', 'UNREAD');
ALTER TABLE "Notification" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Notification" ALTER COLUMN "status" TYPE "NotificationStatus_new" USING ("status"::text::"NotificationStatus_new");
ALTER TYPE "NotificationStatus" RENAME TO "NotificationStatus_old";
ALTER TYPE "NotificationStatus_new" RENAME TO "NotificationStatus";
DROP TYPE "NotificationStatus_old";
ALTER TABLE "Notification" ALTER COLUMN "status" SET DEFAULT 'UNREAD';
COMMIT;

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_player_id_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "event_id",
DROP COLUMN "message_type",
DROP COLUMN "player_id",
ADD COLUMN     "campaign_id" TEXT NOT NULL,
ADD COLUMN     "type" "NotificationType" NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("campaign_id") ON DELETE RESTRICT ON UPDATE CASCADE;
