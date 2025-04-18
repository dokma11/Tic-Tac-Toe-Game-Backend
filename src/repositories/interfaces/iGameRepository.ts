import { Game } from "../../models/game";

export interface IGameRepository {
    create(game: Game): Promise<Game>;
    getById(id: string): Promise<Game>;
    getByPublicId(publicId: string): Promise<Game>;
    start(publicId: string, playerId: string): Promise<Game>;
    cancel(publicId: string): Promise<Game>;
    finish(publicId: string): Promise<Game>;
    handleResult(publicId: string, winnerId: number, loserId: number): Promise<Game>;
    getAllByPlayerId(userId: string): Promise<Game[]>;
    getWithMovesByPublicId(publicId: string): Promise<Game>;
    getAllFinishedWithMovesByPlayerId(userId: string): Promise<Game[]>;
}
