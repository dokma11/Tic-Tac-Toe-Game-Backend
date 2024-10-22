-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "publicId" INTEGER NOT NULL,
    "xPlayerId" INTEGER NOT NULL,
    "yPlayerId" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_publicId_key" ON "Game"("publicId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_xPlayerId_fkey" FOREIGN KEY ("xPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_yPlayerId_fkey" FOREIGN KEY ("yPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
