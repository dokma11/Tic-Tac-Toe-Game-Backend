import { v4 as uuidv4 } from 'uuid';
import { IGameRepository } from "../repositories/interfaces/iGameRepository";
import { Game } from "../models/game";

export class GameService {
    private repository: IGameRepository;

    constructor(gameRepository: IGameRepository) {
        this.repository = gameRepository;
    }

    public async create(type: string, userId: string): Promise<Game> {
        console.log('Game service: create');

        // game's public id is randomized so we need to make sure it doesn't already exist in the database
        let publicId: string;
        // FIXME: Nemoj ovo ovako raditi, postoji recimo Date.now() on vraca unix timestamp ( koji je skoro pa unikatan ) i mozes ga ili iskombinovati sa necim ili imas npm paket uuid v4 ili kako se vec zove
        publicId = uuidv4();
        console.log('Oov je public id nakon promene: ', publicId);

        let game = {
            id: -1,
            publicId: publicId,
            xPlayerId: parseInt(userId),
            yPlayerId: undefined,
            status: 0,
            type: parseInt(type),
        }

        if (type == '1') {
            game.yPlayerId = -111;
            // FIXME: try catch za errore?
            try {
                await this.repository.create(game);
                return await this.repository.start(game.publicId.toString(), game.yPlayerId);
            } catch(e) {
                console.log(e, e.message);
                throw new Error(e);
            }
        }

        try {
            return await this.repository.create(game);
        } catch(e) {
            console.log(e, e.message);
            throw new Error(e);
        }
    }

    public async getById(id: string): Promise<Game> {
        console.log('Game service: get by id: ', id);

        const game: Game =  await this.repository.getById(id);
        if (!game) {
            console.log('Error: could not get the game by id: ', id);
            return null;
        }
        return game
    }

    public async getByPublicId(publicId: string): Promise<Game> {
        console.log('Game service: get by public id: ', publicId);

        const game: Game = await this.repository.getByPublicId(publicId);
        if (!game) {
            console.log('Error: could not get the game by public id: ', publicId);
            return null;
        }
        return game;
    }

    public async getHistoryByPublicId(publicId: string): Promise<Game> {
        console.log('Game service: get history by public id: ', publicId);

        const game: Game = await this.repository.getWithMovesByPublicId(publicId);
        if (!game) {
            console.log('Error: could not get the game with its moves by public id: ', publicId);
            return null;
        }
        return game;
    }

    public async join(publicId: string, userId: string): Promise<Game> {
        console.log(`Game service: join the game with public id: ${publicId} by a user with id: ${userId}`);

        const existingGame = await this.repository.getByPublicId(publicId);
        if (!existingGame || existingGame.status !== 0) {
            console.log('Error: could not join the game with public id: ', publicId);
            return null;
        }

        const game: Game = await this.repository.start(publicId, userId);
        if (!game) {
            console.log(`Error: could not start the game with public id: ${publicId} for user with id: ${userId}`);
            return null;
        }
        return game;
    }

    public async getAllFinishedByPlayerId(playerId: string): Promise<Game[]> {
        console.log('Game service: get all finished by player id: ', playerId);

        const games: Game[] = await this.repository.getAllFinishedWithMovesByPlayerId(playerId);
        if (!games) {
            console.log('Error: could not get all teh finished games for user with id ', playerId);
            return null;
        }
        return games;
    }

    public async cancel(publicId: string, userId: string): Promise<{ success: boolean, game: Game }> {
        console.log(`Game service: cancel the game with public id: ${publicId} by a user with id: ${userId}`);

        const game: Game = await this.repository.getByPublicId(publicId);
        if (!game) {
            console.log('Error: could not get the game with public id: ', publicId);
            return { success: false, game: null };
        }

        // only the games creator (x player) can cancel the game
        if(game.xPlayerId !== parseInt(userId)) {
            return { success: false, game: null };
        }

        const result: Game = await this.repository.cancel(publicId);
        if (!result) {
            console.log(`Error: could not cancel the game with public id: ${publicId} for user with id: ${userId}`);
            return { success: false, game: null };
        }
        return { success: true, game: result };
    }
}
