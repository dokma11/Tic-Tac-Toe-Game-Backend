import { IMoveRepository } from "./interfaces/iMoveRepository";
import { prisma } from "../config/database";
import { Move } from "../models/move";
import { handleDbOperation } from '../middlewares/databaseOperations';

export class MoveRepository implements IMoveRepository {
    constructor() { }

    // FIXME: newMove treba da ima definisan tip
    public async create(newMove): Promise<Move> {
        console.log('Move repository: create');
        return handleDbOperation(
            () => prisma.move.create({
                data: {
                    gameId: newMove.gameId,
                    userId: parseInt(newMove.userId),
                    xCoordinate: newMove.xCoordinate,
                    yCoordinate: newMove.yCoordinate,
                }
            }),
            'Could not create a move'
        );
    }

    public async getAllByGameId(gameId: string): Promise<Move[]> {
        return handleDbOperation(
            () => prisma.move.findMany({
                where: {
                    gameId: parseInt(gameId)
                }
            }),
            'Could not get all the moves by game id'
        );
    }

    public async getAllByGamePublicId(publicId: string): Promise<Move[]> {
        return handleDbOperation(
            () => prisma.move.findMany({
                where: {
                    game: {
                        publicId: parseInt(publicId)
                    }
                }
            }),
            'Could not get all the moves by games public id'
        );
    }

    public async getAllByUserId(userId: string): Promise<Move[]> {
        return handleDbOperation(
            () => prisma.move.findMany({
                where: {
                    userId: parseInt(userId)
                }
            }),
            'Could not get all the moves by user id'
        );
    }

    public async getAllByUserAndGameId(userId: string, publicId: string): Promise<Move[]> {
        return handleDbOperation(
            () => prisma.move.findMany({
                where: {
                    userId: parseInt(userId),
                    game: {
                        publicId: parseInt(publicId)
                    }
                }
            }),
            'Could not get all the moves by user and game id'
        );
    }

}
