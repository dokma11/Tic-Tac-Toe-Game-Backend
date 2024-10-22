import { Move } from "../../models/move";

export interface IMoveRepository {
    create(move): Promise<Move>;
    getAllByGameId(gameId: string): Promise<Move[]>;
    getAllByUserId(userId: string): Promise<Move[]>;
    getLatest(gameId: string): Promise<Move>; // videcu da li mi je neophodan
}
