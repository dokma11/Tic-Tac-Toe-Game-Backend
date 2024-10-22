-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_yPlayerId_fkey";

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "yPlayerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_yPlayerId_fkey" FOREIGN KEY ("yPlayerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
