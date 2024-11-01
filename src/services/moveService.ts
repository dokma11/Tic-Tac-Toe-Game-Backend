import { IMoveRepository } from "../repositories/interfaces/iMoveRepository";
import { Move } from "../models/move";
import { IGameRepository } from "../repositories/interfaces/iGameRepository";

export class MoveService {
    private repository: IMoveRepository;
    private gameRepository: IGameRepository;

    constructor(private readonly moveRepository: IMoveRepository, private readonly iGameRepository: IGameRepository) {
        this.repository = moveRepository;
        this.gameRepository = iGameRepository;
    }

    public async create(moveIndex: string, gameId: string, userId: string): Promise<{success: boolean, move: Move,
        player: string, moveIndex: string, gameOver: boolean, draw: boolean}> {
        console.log('Game service: create');
        const coordinates = this.convertIndexToArray(moveIndex);

        const game = await this.gameRepository.getByPublicId(gameId);
        if(!game) {
            return { success: false, move: null, player: '', moveIndex: '', gameOver: false, draw: false };
        }

        const newMove = {
            gameId: game.id,
            userId: userId,
            xCoordinate: coordinates[0],
            yCoordinate: coordinates[1],
        }

        const result = await this.repository.create(newMove);
        if(!result) {
            return { success: false, move: null, player: '', moveIndex: '', gameOver: false, draw: false };
        }

        return await this.handleNecessaryChecks(game, gameId, userId, result, moveIndex);
    }

    public async getAllByGameId(gameId: string): Promise<Move[]> {
        console.log('Game service: get all by game id');
        return await this.repository.getAllByGameId(gameId);
    }

    public async getAllByUserId(userId: string): Promise<Move[]> {
        console.log('Game service: get all by user id');
        return await this.repository.getAllByUserId(userId);
    }

    public async createComputerMove(gameId) {
        console.log('moveService: create computer move')

        const game = await this.gameRepository.getByPublicId(gameId);
        if(!game) {
            return { success: false, move: null, player: '', moveIndex: '', gameOver: false };
        }

        // id of the "computer user"
        const computerId = "-111";
        const moveCoordinates = await this.chooseMove(game.id);
        const moveIndex = this.convertArrayToIndex(moveCoordinates.xCoordinate, moveCoordinates.yCoordinate);

        const newMove = {
            gameId: game.id,
            userId: parseInt(computerId),
            xCoordinate: moveCoordinates.xCoordinate,
            yCoordinate: moveCoordinates.yCoordinate,
        }

        const result = await this.repository.create(newMove);

        // racunar ce uvek biti y igrac (O)
        if(!result) {
            return { success: false, move: null, player: '', moveIndex: '', gameOver: false };
        }

        // after every move we check if the game is over
        if (await this.isGameOver(gameId, computerId)) {
            return { success: true, move: result, player: 'y', moveIndex: moveIndex, gameOver: true };
        }

        return { success: true, move: result, player: 'y', moveIndex: moveIndex, gameOver: false };
    }

    private async chooseMove(gameId) {
        console.log('move service: choose move');

        const madeMoves = await this.repository.getAllByGameId(gameId);

        if (madeMoves.length === 9){
            console.log('The computer can not choose a move because it has no left moves to make.');
            return { xCoordinate: -1, yCoordinate: -1 };
        }

        // initialize a new move
        let newMove = {
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
        while (madeMoves.some(pos => newMove.xCoordinate === pos.xCoordinate && newMove.yCoordinate === pos.yCoordinate));

        return newMove;
    }

    private convertIndexToArray(index) {
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

    private async isGameOver(gameId: string, userId: string) {
        console.log('Game service: is game over');

        // user must have at least three moves made so he/she could win
        const userMoves = await this.repository.getAllByUserAndGameId(userId, gameId);
        if (userMoves.length < 3) return false;

        const winningCombinations = [
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

        return await this.checkWinningCombination(winningCombinations, userMoves, userId, gameId);
    }

    private async checkWinningCombination(winningCombinations, userMoves, userId, gameId) {
        for (const combination of winningCombinations) {
            const hasWinningCombination = combination.every(pos =>
                userMoves.some(move => move.xCoordinate === pos.x && move.yCoordinate === pos.y)
            );

            if (hasWinningCombination) {
                console.log(`Player ${userId} has won the game!`);
                return this.handleGameFinish(gameId, userId);
            }
        }
    }

    private async handleNecessaryChecks(game, gameId, userId, result, moveIndex) {
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

    private async handleGameFinish(gameId, userId) {
        const result = await this.gameRepository.finish(gameId);
        if (!result) return false;

        const game = await this.gameRepository.getByPublicId(gameId);
        if (!game) return false;

        // see if the winner is the x player
        if (userId === game.xPlayerId.toString()) {
            return await this.gameRepository.handleResult(gameId, parseInt(userId), game.yPlayerId);
        }

        return await this.gameRepository.handleResult(gameId, parseInt(userId), game.xPlayerId);
    }

    private async isGameADraw(gameId: string) {
        console.log('Game service: is game a draw');

        const allMoves = await this.repository.getAllByGamePublicId(gameId);
        if (allMoves.length !== 9) return false;

        console.log('The game is a draw!');
        await this.gameRepository.finish(gameId);
        return true
    }
}
