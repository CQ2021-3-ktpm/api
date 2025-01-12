/*
  Warnings:

  - A unique constraint covering the columns `[player_id]` on the table `Credit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Credit_player_id_key" ON "Credit"("player_id");
