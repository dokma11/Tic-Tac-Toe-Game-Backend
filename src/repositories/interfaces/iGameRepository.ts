import { Game } from "../../models/game";

export interface IGameRepository {
    create(game): Promise<Game>;
    getById(id: string): Promise<Game>;
    getByPublicId(publicId: string): Promise<Game>;
    startGame(publicId: string, playerId: string): Promise<Game>;
}
