import { IMoveRepository } from "../repositories/interfaces/iMoveRepository";
import { Move } from "../models/move";
import { IGameRepository } from "../repositories/interfaces/iGameRepository";

export class MoveService {
    private repository: IMoveRepository;
    private gameRepository: IGameRepository;

    constructor(private readonly moveRepository: IMoveRepository, private readonly igameRepository: IGameRepository) {
        this.repository = moveRepository;
        this.gameRepository = igameRepository;
    }

    // ovde moram napraviti algoritam koji ce da proveri da li je partija gotova, ne mora nuzno bas u ovoj metodi, moze da se izdvoji recimo
    public async create(moveIndex: string, gameId: string, userId: string): Promise<{success: boolean, move: Move, player: string, moveIndex: string}> {
        const coordinates = this.convertIndexToArray(moveIndex);

        const game = await this.gameRepository.getByPublicId(gameId);

        const newMove = {
            gameId: game.id,
            userId: userId,
            xCoordinate: coordinates[0],
            yCoordinate: coordinates[1],
        }

        const result = await this.repository.create(newMove);

        if(!result) return { success: false, move: null, player: '', moveIndex: '' };

        if (game.xPlayerId === parseInt(userId)) {
            return { success: true, move: result, player: 'x', moveIndex: moveIndex };
        }

        return { success: true, move: result, player: 'y', moveIndex: moveIndex };
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

    private async isGameOver(gameId) {
        const moves = await this.repository.getAllByGameId(gameId);

        // mozda da nekako podelim na jednog i drugog korisnika

        const firstUserMoves = moves.filter(move => move.userId);
        const secondUserMoves = moves.filter(move => move.userId);

        if (firstUserMoves.filter(move => move.xCoordinate === 0).length == 3) {
            // game finished
        }

        if (firstUserMoves.filter(move => move.xCoordinate === 1).length == 3) {
            // game finished
        }

        if (firstUserMoves.filter(move => move.xCoordinate === 2).length == 3) {
            // game finished
        }

        if (firstUserMoves.filter(move => move.yCoordinate === 0).length == 3) {
            // game finished
        }

        if (firstUserMoves.filter(move => move.yCoordinate === 1).length == 3) {
            // game finished
        }

        if (firstUserMoves.filter(move => move.yCoordinate === 2).length == 3) {
            // game finished
        }

        if (secondUserMoves.filter(move => move.xCoordinate === 0).length == 3) {
            // game finished
        }

        if (secondUserMoves.filter(move => move.xCoordinate === 1).length == 3) {
            // game finished
        }

        if (secondUserMoves.filter(move => move.xCoordinate === 2).length == 3) {
            // game finished
        }

        if (secondUserMoves.filter(move => move.yCoordinate === 0)) {
            // game finished
        }

        if (secondUserMoves.filter(move => move.yCoordinate === 1)) {
            // game finished
        }

        if (secondUserMoves.filter(move => move.yCoordinate === 2)) {
            // game finished
        }


    }
}
