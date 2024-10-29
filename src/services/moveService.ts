import { IMoveRepository } from "../repositories/interfaces/iMoveRepository";
import { Move } from "../models/move";
import { IGameRepository } from "../repositories/interfaces/iGameRepository";

export class MoveService {
    private repository: IMoveRepository;
    private gameRepository: IGameRepository;

    constructor(private readonly moveRepository: IMoveRepository, private readonly iGameRepository: IGameRepository) {
        this.repository = moveRepository;
        this.gameRepository = iGameRepository;
    }

    public async create(moveIndex: string, gameId: string, userId: string): Promise<{success: boolean, move: Move,
        player: string, moveIndex: string, gameOver: boolean}> {
        const coordinates = this.convertIndexToArray(moveIndex);

        const game = await this.gameRepository.getByPublicId(gameId);545621183

        const newMove = {
            gameId: game.id,
            userId: userId,
            xCoordinate: coordinates[0],
            yCoordinate: coordinates[1],
        }

        const result = await this.repository.create(newMove);

        if(!result) return { success: false, move: null, player: '', moveIndex: '', gameOver: false };

        // after every move we check if the game is over
        if (await this.isGameOver(gameId, userId)) {
            if (game.xPlayerId === parseInt(userId)) return { success: true, move: result, player: 'x', moveIndex: moveIndex, gameOver: true };
            return { success: true, move: result, player: 'y', moveIndex: moveIndex, gameOver: true };
        }

        if (game.xPlayerId === parseInt(userId)) {
            return { success: true, move: result, player: 'x', moveIndex: moveIndex, gameOver: false };
        }

        return { success: true, move: result, player: 'y', moveIndex: moveIndex, gameOver: false };
    }

    public async getAllByGameId(gameId: string): Promise<Move[]> {
        return await this.repository.getAllByGameId(gameId);
    }

    public async getAllByUserId(userId: string): Promise<Move[]> {
        return await this.repository.getAllByUserId(userId);
    }

    private convertIndexToArray(index) {
        switch(parseInt(index)) {
            case 0:
                return [0, 0];
            case 1:
                return [1, 0];
            case 2:
                return [2, 0];
            case 3:
                return [0, 1];
            case 4:
                return [1, 1];
            case 5:
                return [2, 1];
            case 6:
                return [0, 2];
            case 7:
                return [1, 2];
            case 8:
                return [2, 2];
        }
    }

    private async isGameOver(gameId: string, userId: string) {
        const userMoves = await this.repository.getAllByUserAndGameId(userId, gameId);

        // user must have at least three moves made so he/she could win
        if (userMoves.length < 3) return false;

        const winningCombinations = [
            // winning rows
            [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
            [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
            [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
            // winning columns
            [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
            [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
            [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
            // winning diagonals
            [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
            [{ x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 0 }],
        ];

        for (const combination of winningCombinations) {
            const hasWinningCombination = combination.every(pos =>
                userMoves.some(move => move.xCoordinate === pos.x && move.yCoordinate === pos.y)
            );

            if (hasWinningCombination) {
                console.log(`Player ${userId} has won the game!`);
                return true;
            }
        }

        return false;
    }

}
