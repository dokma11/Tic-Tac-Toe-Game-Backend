import { IGameRepository } from "./interfaces/iGameRepository";
import { prisma } from "../config/database";
import { Game } from "../models/game";
import { handleDbOperation } from '../middlewares/databaseOperations';

export class GameRepository implements IGameRepository {
    constructor() { }

    public async create(newGame): Promise<Game> {
        console.log('Game repository: create')
        return handleDbOperation(
            () => prisma.game.create({
                data: {
                    publicId: newGame.publicId,
                    xPlayerId: parseInt(newGame.xPlayerId),
                    status: newGame.status,
                    type: newGame.type,
                }
            }),
            'Could not create a game'
        );
    }

    public async getById(id: string): Promise<Game> {
        console.log(`Game repository: get by id: ${id}`);
        return handleDbOperation(
            () => prisma.game.findUnique({
                where: {
                    id: parseInt(id)
                }
            }),
            'Could not get the game by id'
        );
    }

    public async getByPublicId(publicId:string) {
        console.log(`Game repository: get by publicId: ${publicId}`);
        return handleDbOperation(
            () => prisma.game.findUnique({
                where: {
                    publicId: parseInt(publicId)
                }
            }),
            'Could not get the game by public id'
        );
    }

    public async getWithMovesByPublicId(publicId: string) {
        console.log(`Game repository: get game with moves by public id: ${publicId}`);
        return handleDbOperation(
            () => prisma.game.findUnique({
                where: {
                    publicId: parseInt(publicId),
                },
                include: {
                    moves: true,
                },
            }),
            'Could not get the game with its moves by public id'
        )
    }

    // start game includes updating game's status and adding the id of the opposing player (if the game is of multiplayer type)
    public async start(publicId: string, playerId: string): Promise<Game> {
        console.log(`Game repository: start game with publicId: ${publicId} and playerId: ${playerId}`);
        return handleDbOperation(
            () => prisma.game.update({
                where: {
                    publicId: parseInt(publicId)
                },
                data: {
                    yPlayerId: parseInt(playerId),
                    status: 1,
                    startedAt: new Date(),
                }
            }),
            'Could not start game with publicId',
        )
    }

    public async cancel(publicId): Promise<Game> {
        console.log(`Game repository: cancel game with publicId: ${publicId}`);
        return handleDbOperation(
            () => prisma.game.update({
                where: {
                    publicId: parseInt(publicId)
                },
                data: {
                    status: 3
                }
            }),
            'Could not cancel game with publicId'
        )
    }

    public async finish(publicId): Promise<Game> {
        console.log(`Game repository: finish the game with publicId: ${publicId}`);
        return handleDbOperation(
            () => prisma.game.update({
                where: {
                    publicId: parseInt(publicId)
                },
                data: {
                    status: 2,
                    completedAt: new Date(),
                }
            }),
            'Could not finish game with publicId',
        );
    }

    public async handleResult(publicId: string, winnerId: number, loserId: number): Promise<Game> {
        console.log(`Game repository: handle the result of the finished game with publicId: ${publicId}`);
        return handleDbOperation(
            () => prisma.game.update({
                where: {
                    publicId: parseInt(publicId)
                },
                data: {
                    winnerId: winnerId,
                    loserId: loserId,
                }
            }),
            'Could not handle the result of the finished game with publicId',
        );
    }

    public async getAllByWinnerId(userId: string): Promise<Game[]> {
        console.log(`Game repository: get all by winner id: ${userId}`);
        return handleDbOperation(
            () => prisma.game.findMany({
                where: {
                    winnerId: parseInt(userId),
                    status: 2
                }
            }),
            'Could not get all the games by the winner id'
        );
    }

    public async getAllByLoserId(userId: string): Promise<Game[]> {
        console.log(`Game repository: get all by loser id: ${userId}`);
        return handleDbOperation(
            () => prisma.game.findMany({
                where: {
                    loserId: parseInt(userId),
                    status: 2
                }
            }),
            'Could not get all the games by the loser id'
        );
    }

    public async getAllByPlayerId(userId: string): Promise<Game[]> {
        console.log(`Game repository: get all by player id: ${userId}`);
        return handleDbOperation(
            () => prisma.game.findMany({
                where: {
                    OR: [
                        { xPlayerId: parseInt(userId) },
                        { yPlayerId: parseInt(userId) }
                    ],
                    status: 2
                }
            }),
            'Could not get all games by player id',
        );
    }

    public async getAllFinishedWithMovesByPlayerId(userId: string): Promise<Game[]> {
        console.log(`Game repository: get all finished with moves by player id: ${userId}`);
        return handleDbOperation(
            () => prisma.game.findMany({
                where: {
                    OR: [
                        { xPlayerId: parseInt(userId) },
                        { yPlayerId: parseInt(userId) }
                    ],
                    status: 2
                },
                include: {
                    moves: true,
                    xPlayer: true,
                    yPlayer: true
                }
            }),
            'Could not get all finished games with moves by player id',
        );
    }
}
