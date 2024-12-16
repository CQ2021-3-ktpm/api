/*
  Warnings:

  - You are about to drop the column `budget` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `event_id` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voucher_id` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voucher_quantity` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "budget",
DROP COLUMN "event_id",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "voucher_id" TEXT NOT NULL,
ADD COLUMN     "voucher_quantity" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Event";
