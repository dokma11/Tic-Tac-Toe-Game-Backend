import { Game } from "../../models/game";

export interface IGameRepository {
    create(game): Promise<Game>;
    getById(id: string): Promise<Game>;
    getByPublicId(publicId: string): Promise<Game>;
    start(publicId: string, playerId: string): Promise<Game>;
    cancel(publicId: string): Promise<Game>;
    finish(publicId: string): Promise<Game>;
}
