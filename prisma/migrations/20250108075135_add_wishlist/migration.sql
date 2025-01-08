-- CreateTable
CREATE TABLE "CampaignWishlist" (
    "wishlist_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignWishlist_pkey" PRIMARY KEY ("wishlist_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignWishlist_user_id_campaign_id_key" ON "CampaignWishlist"("user_id", "campaign_id");

-- AddForeignKey
ALTER TABLE "CampaignWishlist" ADD CONSTRAINT "CampaignWishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignWishlist" ADD CONSTRAINT "CampaignWishlist_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("campaign_id") ON DELETE RESTRICT ON UPDATE CASCADE;
