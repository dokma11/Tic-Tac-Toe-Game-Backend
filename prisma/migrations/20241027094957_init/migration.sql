/*
  Warnings:

  - A unique constraint covering the columns `[gameId,xCoordinate,yCoordinate]` on the table `Move` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Move_gameId_xCoordinate_yCoordinate_key" ON "Move"("gameId", "xCoordinate", "yCoordinate");
