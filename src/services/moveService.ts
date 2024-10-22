import { IMoveRepository } from "../repositories/interfaces/iMoveRepository";
import { Move } from "../models/move";

export class MoveService {
    private repository: IMoveRepository;

    constructor(private readonly moveRepository: IMoveRepository) {
        this.repository = moveRepository;
    }

    public async create(move, userId: string): Promise<{success: boolean, move: Move}> {
        const newMove = {
            gameId: move.gameId,
            userId: userId,
            xCoordinate: move.xCoordinate,
            yCoordinate: move.yCoordinate,
        }

        const result = await this.repository.create(newMove);

        if(!result) return { success: false, move: null };

        return  { success: true, move: result };
    }

    public async getAllByGameId(gameId: string): Promise<Move[]> {
        return await this.repository.getAllByGameId(gameId);
    }

    public async getAllByUserId(userId: string): Promise<Move[]> {
        return await this.repository.getAllByUserId(userId);
    }

    public async getLatest(gameId: string): Promise<Move> {
        return await this.repository.getLatest(gameId);
    }
}
