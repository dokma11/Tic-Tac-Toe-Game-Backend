import { IGameRepository } from "../repositories/interfaces/iGameRepository";
import { Game } from "../models/game";

export class GameService {
    private repository: IGameRepository;

    constructor(gameRepository: IGameRepository) {
        this.repository = gameRepository;
    }

    public async create(type: string, userId: string) {
        console.log('Game service: create');

        // make sure the randomized public id doesn't already exist
        let publicId: number;
        let existingGame: any;
        do {
            publicId = Math.floor(100000000 + Math.random() * 900000000);
            existingGame = await this.repository.getByPublicId(publicId.toString());
        } while (existingGame)

        const game = {
            publicId: publicId,
            xPlayerId: userId,
            status: 0,
            type: type,
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

    public async join(publicId: string, id: string) {
        return await this.repository.start(publicId, id);
    }

    public async cancel(publicId: string, userId: string) {
        const game = await this.repository.getByPublicId(publicId);

        // only the games creator (x player) can cancel the game
        if(game.xPlayerId !== parseInt(userId)) return { success: false, game: null };

        const result = await this.repository.cancel(publicId);
        return { success: true, game: result };
    }
}
