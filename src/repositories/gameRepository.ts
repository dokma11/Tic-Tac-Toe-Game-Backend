import { IGameRepository } from "./interfaces/iGameRepository";
import { prisma } from "../config/database";
import { Game } from "../models/game";

export class GameRepository implements IGameRepository {
    constructor() { }

    public async create(newGame): Promise<Game> {
        console.log('Game repository: create')

        return await prisma.game.create({
            data: {
                publicId: newGame.publicId,
                xPlayerId: newGame.xPlayerId,
                status: newGame.status,
                type: newGame.type,
            }
        });
    }

    public async getById(id: string): Promise<Game> {
        return await prisma.game.findUnique({
            where: {
                id: parseInt(id)
            }
        });
    }

    public async getByPublicId(publicId:string) {
        return await prisma.game.findUnique({
            where: {
                publicId: parseInt(publicId)
            }
        });
    }

    // start game includes updating game's status and adding the id of the opposing player (if the game is of multiplayer type)
    public async startGame(publicId: string, playerId: string): Promise<Game> {
        console.log('Game repository: start game with public id: ' + publicId + ' joined by y player with id: ' + id);

        return await prisma.game.update({
            where: {
                publicId: parseInt(publicId)
            },
            data: {
                yPlayerId: parseInt(playerId),
                status: 1,
                startedAt: new Date(),
            }
        });
    }
}
