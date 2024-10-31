import { IGameRepository } from "../repositories/interfaces/iGameRepository";
import { Game } from "../models/game";

export class GameService {
    private repository: IGameRepository;

    constructor(gameRepository: IGameRepository) {
        this.repository = gameRepository;
    }

    public async create(type: string, userId: string) {
        console.log('Game service: create');

        // game's public id is randomized so we need to make sure it doesn't already exist in the database
        let publicId: number;
        let existingGame: any;
        do {
            publicId = Math.floor(100000000 + Math.random() * 900000000);
            existingGame = await this.repository.getByPublicId(publicId.toString());
        } while (existingGame)

        let game = {
            publicId: publicId,
            xPlayerId: userId,
            yPlayerId: undefined,
            status: 0,
            type: type,
        }

        if (type == '1') {
            game.yPlayerId = -111;
            await this.repository.create(game);
            return await this.repository.start(game.publicId.toString(), game.yPlayerId);
        }

        return await this.repository.create(game);
    }

    public async getById(id: string): Promise<Game> {
        console.log('Game service: get by id: ' + id);
        return await this.repository.getById(id);
    }

    public async getByPublicId(publicId: string): Promise<Game> {
        console.log('Game service: get by public id: ' + publicId);
        return await this.repository.getByPublicId(publicId);
    }

    public async getHistoryByPublicId(publicId: string) {
        console.log('Game service: get history by public id: ' + publicId);
        return await this.repository.getWithMovesByPublicId(publicId);
    }

    public async join(publicId: string, userId: string) {
        console.log('Game service: join the game with public id: ' + publicId + ' by a user with id: ' + userId);
        return await this.repository.start(publicId, userId);
    }

    public async getAllFinishedByPlayerId(playerId: string) {
        console.log('Game service: get all finished by player id: ' + playerId);
        return await this.repository.getAllFinishedWithMovesByPlayerId(playerId);
    }

    public async cancel(publicId: string, userId: string) {
        console.log('Game service: cancel the game with public id: ' + publicId + ' by a user with id: ' + userId);
        const game = await this.repository.getByPublicId(publicId);

        // only the games creator (x player) can cancel the game
        if(game.xPlayerId !== parseInt(userId)) return { success: false, game: null };

        const result = await this.repository.cancel(publicId);
        return { success: true, game: result };
    }
}
