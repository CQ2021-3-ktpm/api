/*
  Warnings:

  - You are about to drop the column `voucher_quantity` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the column `qr_code` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Voucher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `UserVoucher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[qr_code]` on the table `UserVoucher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `UserVoucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Voucher` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Voucher_code_key";

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "voucher_quantity";

-- AlterTable
ALTER TABLE "UserVoucher" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "qr_code" TEXT;

-- AlterTable
ALTER TABLE "Voucher" DROP COLUMN "code",
DROP COLUMN "qr_code",
DROP COLUMN "status",
ADD COLUMN     "quantity" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserVoucher_code_key" ON "UserVoucher"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserVoucher_qr_code_key" ON "UserVoucher"("qr_code");
