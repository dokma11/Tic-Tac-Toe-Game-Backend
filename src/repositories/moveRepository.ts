import { IMoveRepository } from "./interfaces/iMoveRepository";
import { prisma } from "../config/database";
import { Move } from "../models/move";

export class MoveRepository implements IMoveRepository {
    constructor() { }

    public async create(newMove): Promise<Move> {
        console.log('Move repository: create');

        return await prisma.move.create({
            data: {
                gameId: newMove.gameId,
                userId: parseInt(newMove.userId),
                xCoordinate: newMove.xCoordinate,
                yCoordinate: newMove.yCoordinate,
            }
        });
    }

    public async getAllByGameId(gameId: string): Promise<Move[]> {
        return await prisma.move.findMany({
            where: {
                gameId: parseInt(gameId)
            }
        });
    }

    public async getAllByUserId(userId: string): Promise<Move[]> {
        return await prisma.move.findMany({
            where: {
                userId: parseInt(userId)
            }
        });
    }

    public async getLatest(gameId: string): Promise<Move> {
        return await prisma.move.findFirst({
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

}
