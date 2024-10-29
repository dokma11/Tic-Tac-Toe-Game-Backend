import { Move } from "../../models/move";

export interface IMoveRepository {
    create(move): Promise<Move>;
    getAllByGameId(gameId: string): Promise<Move[]>;
    getAllByGamePublicId(publicId: string): Promise<Move[]>;
    getAllByUserId(userId: string): Promise<Move[]>;
    getAllByUserAndGameId(userId: string, gameId: string): Promise<Move[]>;
}
