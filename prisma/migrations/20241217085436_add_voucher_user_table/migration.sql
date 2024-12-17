-- CreateTable
CREATE TABLE "UserVoucher" (
    "user_voucher_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "voucher_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),
    "status" "VoucherStatus" NOT NULL DEFAULT 'UNUSED',

    CONSTRAINT "UserVoucher_pkey" PRIMARY KEY ("user_voucher_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserVoucher_user_id_voucher_id_assigned_at_key" ON "UserVoucher"("user_id", "voucher_id", "assigned_at");

-- AddForeignKey
ALTER TABLE "UserVoucher" ADD CONSTRAINT "UserVoucher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVoucher" ADD CONSTRAINT "UserVoucher_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "Voucher"("voucher_id") ON DELETE RESTRICT ON UPDATE CASCADE;
