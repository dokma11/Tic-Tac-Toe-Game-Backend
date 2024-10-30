import { Move } from "./move";

export class Game {
    id: number;
    publicId: number; // this is the id that the users will get, so they can join a game
    xPlayerId: number; // identifier of the user that is playing as an X player
    yPlayerId: number; // identifier of the user that is playing as a Y player
    status: gameStatus;
    type: gameType;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    winnerId?: number; // identifier of the user that has won the game
    loserId?: number; // identifier of the user that has lost the game
    moves?: Move[]; // all moves made during the game
}

export enum gameStatus {
    CREATED = 0,
    STARTED = 1,
    COMPLETED = 2,
    CANCELLED = 3
}

export enum gameType {
    SINGLE_PLAYER = 0,
    MULTIPLAYER = 0,
}
