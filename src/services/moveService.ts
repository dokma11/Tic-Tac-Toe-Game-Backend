import { IMoveRepository } from "../repositories/interfaces/iMoveRepository";
import { IGameRepository } from "../repositories/interfaces/iGameRepository";
import { Move } from "../models/move";
import { Game } from "../models/game";

export class MoveService {
    private repository: IMoveRepository;
    private gameRepository: IGameRepository;

    constructor(private readonly moveRepository: IMoveRepository, private readonly iGameRepository: IGameRepository) {
        this.repository = moveRepository;
        this.gameRepository = iGameRepository;
    }

    public async create(moveIndex: string, gameId: string, userId: string): Promise<{success: boolean, move: Move,
        player: string, moveIndex: string, gameOver: boolean, draw: boolean}> {

        console.log('Move service: create');
        const coordinates: number[] = this.convertIndexToArray(moveIndex);

        const game: Game = await this.gameRepository.getByPublicId(gameId);
        if (!game) {
            console.log('Error: could not get the game by its public id: ', gameId);
            return { success: false, move: null, player: '', moveIndex: '', gameOver: false, draw: false };
        }

        const newMove = {
            id: -1,
            gameId: game.id,
            userId: parseInt(userId),
            xCoordinate: coordinates[0],
            yCoordinate: coordinates[1],
        }

        console.log('newMove: ', newMove);

        const result: Move = await this.repository.create(newMove);
        if (!result) {
            console.log('Error: could not create a new move');
            return { success: false, move: null, player: '', moveIndex: '', gameOver: false, draw: false };
        }

        try {
            return await this.handleNecessaryChecks(game, gameId, userId, result, moveIndex);
        } catch (e) {
            console.log(e, e.message);
            throw new Error(e);
        }
    }

    public async getAllByGameId(gameId: string): Promise<Move[]> {
        console.log('Game service: get all by game id');

        const moves: Move[] = await this.repository.getAllByGameId(gameId);
        if (!moves) {
            console.log('Error: Could not get all moves by game id: ', gameId);
            return null;
        }
        return moves;
    }

    public async getAllByUserId(userId: string): Promise<Move[]> {
        console.log('Game service: get all by user id');

        const moves: Move[] = await this.repository.getAllByUserId(userId);
        if (!moves) {
            console.log('Error: Could not get all moves by user id: ', userId);
            return null;
        }
        return moves;
    }

    public async createComputerMove(gameId: string): Promise<{ success: boolean, move: Move, player: string, moveIndex: string, gameOver: boolean }> {
        console.log('moveService: create computer move')

        const game: Game = await this.gameRepository.getByPublicId(gameId);
        if (!game) {
            console.log('Error: Could not get the game by public id: ', gameId);
            return { success: false, move: null, player: '', moveIndex: '', gameOver: false };
        }

        // id of the "computer user"
        const computerId = "-111";
        const moveCoordinates: { xCoordinate: number, yCoordinate: number } = await this.chooseMove(game.id.toString());
        if (!moveCoordinates) {
            console.log('Error: could not choose a move for the computer');
            return { success: false, move: null, player: '', moveIndex: '', gameOver: false };
        }
        const moveIndex: number = this.convertArrayToIndex(moveCoordinates.xCoordinate, moveCoordinates.yCoordinate);

        const newMove = {
            id: -1,
            gameId: game.id,
            userId: parseInt(computerId),
            xCoordinate: moveCoordinates.xCoordinate,
            yCoordinate: moveCoordinates.yCoordinate,
        }

        // racunar ce uvek biti y igrac (O)
        const result: Move = await this.repository.create(newMove);
        if (!result) {
            console.log('Error: Could not create a new move');
            return { success: false, move: null, player: '', moveIndex: '', gameOver: false };
        }

        // after every move we check if the game is over
        if (await this.isGameOver(gameId, computerId)) {
            return { success: true, move: result, player: 'y', moveIndex: moveIndex.toString(), gameOver: true };
        }

        return { success: true, move: result, player: 'y', moveIndex: moveIndex.toString(), gameOver: false };
    }

    private async chooseMove(gameId: string): Promise<{ xCoordinate: number, yCoordinate: number }> {
        console.log('move service: choose move');

        const madeMoves: Move[] = await this.repository.getAllByGameId(gameId);
        if (madeMoves.length === 9){
            console.log('The computer can not choose a move because it has no left moves to make.');
            return { xCoordinate: -1, yCoordinate: -1 };
        }

        // initialize a new move
        let newMove: { xCoordinate: number, yCoordinate: number } = {
            xCoordinate: 1,
            yCoordinate: 1,
        };

        // if the new move is already made, generate a new one - moram proveriti da li ih je 9, onda logicno ne moze ni da napravi potez
        do {
            newMove = {
                xCoordinate: Math.floor(Math.random() * 3),
                yCoordinate: Math.floor(Math.random() * 3)
            };
        }
        while (madeMoves.some((pos: Move): boolean => newMove.xCoordinate === pos.xCoordinate && newMove.yCoordinate === pos.yCoordinate));

        return newMove;
    }

    private convertIndexToArray(index: string): number[] {
        console.log('Game service: convert index to array');

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

    private convertArrayToIndex(x: number, y: number): number | null {
        console.log('Game service: convert array to index');

        if (x === 0 && y === 0) return 0;
        if (x === 1 && y === 0) return 1;
        if (x === 2 && y === 0) return 2;
        if (x === 0 && y === 1) return 3;
        if (x === 1 && y === 1) return 4;
        if (x === 2 && y === 1) return 5;
        if (x === 0 && y === 2) return 6;
        if (x === 1 && y === 2) return 7;
        if (x === 2 && y === 2) return 8;
        return null;
    }

    private async isGameOver(gameId: string, userId: string): Promise<Game> {
        console.log('Game service: is game over');

        // user must have at least three moves made so he/she could win
        const userMoves: Move[] = await this.repository.getAllByUserAndGameId(userId, gameId);
        if (userMoves.length < 3){
            console.log('The user has not made three moves so there is no possible way for the game to be over');
            return undefined;
        }

        const winningCombinations: { x: number, y: number }[][] = [
            // winning rows
            [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
            [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
            [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
            // winning columns
            [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
            [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
            [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
            // winning diagonals
            [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
            [{ x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 0 }],
        ];

        try {
            return await this.checkWinningCombination(winningCombinations, userMoves, userId, gameId);
        } catch (e) {
            console.log(e, e.message);
            throw new Error(e);
        }
    }

    private async checkWinningCombination(winningCombinations: { x: number, y: number }[][], userMoves: Move[], userId: string, gameId: string): Promise<Game> {
        for (const combination of winningCombinations) {
            const hasWinningCombination: boolean = combination.every((pos: { x: number, y: number }): boolean =>
                userMoves.some((move: Move): boolean => move.xCoordinate === pos.x && move.yCoordinate === pos.y)
            );

            if (hasWinningCombination) {
                console.log(`Player ${userId} has won the game!`);
                try {
                    return await this.handleGameFinish(gameId, userId);
                }
                catch (e) {
                    console.log(e, e.message);
                    throw new Error(e);
                }
            }
        }
    }

    private async handleNecessaryChecks(game: Game, gameId: string, userId: string, result: Move, moveIndex: string):
        Promise<{ success: boolean, move: Move, player: string, moveIndex: string, gameOver: boolean, draw: boolean }> {
        // after every move we check if the game is over (win or loss)
        if (await this.isGameOver(gameId, userId)) {
            if (game.xPlayerId === parseInt(userId)) return { success: true, move: result, player: 'x', moveIndex: moveIndex, gameOver: true, draw: false };
            return { success: true, move: result, player: 'y', moveIndex: moveIndex, gameOver: true, draw: false };
        }

        // after every move we check if the game is a draw
        if (await this.isGameADraw(gameId)) {
            return { success: true, move: result, player: 'x', moveIndex: moveIndex, gameOver: true, draw: true };
        }

        // check which player has played the move
        if (game.xPlayerId === parseInt(userId)) {
            return { success: true, move: result, player: 'x', moveIndex: moveIndex, gameOver: false, draw: false };
        }

        return { success: true, move: result, player: 'y', moveIndex: moveIndex, gameOver: false, draw: false };
    }

    private async handleGameFinish(gameId: string, userId: string): Promise<Game> {
        const result: Game = await this.gameRepository.finish(gameId);
        if (!result) {
            console.log('Error: the game could not be finished, public id: ', gameId);
            return null;
        }

        const game: Game = await this.gameRepository.getByPublicId(gameId);
        if (!game) {
            console.log('Error: could not get the game with public id: ', gameId);
            return null;
        }

        // see if the winner is the x player
        if (userId === game.xPlayerId.toString()) {
            try {
                return await this.gameRepository.handleResult(gameId, parseInt(userId), game.yPlayerId);
            } catch (e) {
                console.log(e, e.message);
                throw new Error(e);
            }
        }

        try {
            return await this.gameRepository.handleResult(gameId, parseInt(userId), game.xPlayerId);
        } catch (e) {
            console.log(e, e.message);
            throw new Error(e);
        }
    }

    private async isGameADraw(gameId: string): Promise<boolean> {
        console.log('Game service: is game a draw');

        const allMoves: Move[] = await this.repository.getAllByGamePublicId(gameId);
        if (!allMoves) {
            console.log('Error: could not get all the moves by game public id: ', gameId);
            throw new Error('Error: could not get all the moves by game public id');
        }

        if (allMoves.length !== 9) {
            console.log('There are no nine moves made so the game can not possibly be a draw');
            return false;
        }

        console.log('The game is a draw!');

        try {
            await this.gameRepository.finish(gameId);
        } catch (e) {
            console.error(e, e.message);
            throw new Error(e);
        }

        return true
    }
}
