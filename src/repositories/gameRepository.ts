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
                xPlayerId: parseInt(newGame.xPlayerId),
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
    public async start(publicId: string, playerId: string): Promise<Game> {
        console.log(`Game repository: start game with publicId: ${publicId} and playerId: ${playerId}`);

        try {
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
        } catch (error) {
            console.error('Failed to start the game:', error);
            throw new Error('Could not start game.');
        }
    }

    public async cancel(publicId): Promise<Game> {
        console.log(`Game repository: cancel game with publicId: ${publicId}`);

        try {
            return await prisma.game.update({
                where: {
                    publicId: parseInt(publicId)
                },
                data: {
                    status: 3
                }
            });
        } catch (error) {
            console.error('Failed to cancel game:', error);
            throw new Error('Could not cancel game.');
        }
    }

    public async finish(publicId): Promise<Game> {
        console.log(`Game repository: finish the game with publicId: ${publicId}`);

        try {
            return await prisma.game.update({
                where: {
                    publicId: parseInt(publicId)
                },
                data: {
                    status: 2,
                    completedAt: new Date(),
                }
            });
        } catch (error) {
            console.error('Failed to finish the game:', error);
            throw new Error('Could not finish the game.');
        }
    }

    public async handleResult(publicId: string, winnerId: number, loserId: number): Promise<Game> {
        console.log(`Game repository: handle the result of the finished game with publicId: ${publicId}`);

        try {
            return await prisma.game.update({
                where: {
                    publicId: parseInt(publicId)
                },
                data: {
                    winnerId: winnerId,
                    loserId: loserId,
                }
            });
        } catch (error) {
            console.error('Failed to handle the result of the finished game:', error);
            throw new Error('Could not handle the result of the finished game.');
        }
    }

    public async getAllByWinnerId(userId: string): Promise<Game[]> {
        return await prisma.game.findMany({
            where: {
                winnerId: parseInt(userId)
            }
        });
    }

    public async getAllByLoserId(userId: string): Promise<Game[]> {
        return await prisma.game.findMany({
            where: {
                loserId: parseInt(userId)
            }
        });
    }

    public async getAllByPlayerId(userId: string): Promise<Game[]> {
        return await prisma.game.findMany({
            where: {
                OR: [
                    { xPlayerId: parseInt(userId) },
                    { yPlayerId: parseInt(userId) }
                ]
            }
        });
    }
}
