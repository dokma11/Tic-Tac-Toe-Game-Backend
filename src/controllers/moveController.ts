import { MoveService } from "../services/moveService";
import { Router, Request, Response } from "express";
import { MoveRepository } from "../repositories/moveRepository";
import { GameRepository } from "../repositories/gameRepository";
const jwt = require('jsonwebtoken');

export class MoveController {
    private router: Router;

    constructor(private readonly service: MoveService) {
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.get("/game-id/:gameId", this.getAllByGameId.bind(this));
        this.router.get("/user-id/:userId", this.getAllByUserId.bind(this));
    }

    public async handleWebSocketMessage(message: any): Promise<{success: boolean, gameId: string, player: string,
        moveIndex: string, gameOver: boolean, draw: boolean}> {
        console.log('Move controller: WebSocket create');

        if (!message) {
            console.log('Message unavailable');
            return { success: false, gameId: '', player: '', moveIndex: '', gameOver: false, draw: false };
        }

        const messageParts = message.toString().split(';');
        if (messageParts.length != 3) {
            console.log('Message has wrong length');
            return { success: false, gameId: '', player: '', moveIndex: '', gameOver: false, draw: false };
        }

        const moveIndex =  messageParts[0].split(':')[1];
        const gameId = messageParts[1];
        const token = messageParts[2].slice(0, -1);

        try {
            const decoded = jwt.verify(token, process.env.JWT as string) as { id: number };

            const result = await this.service.create(moveIndex, gameId, decoded.id.toString());
            if (!result.success) {
                console.log('Failed to create the move for the game with id: ' + gameId);
                return { success: false, gameId: gameId, player: '', moveIndex: '', gameOver: false, draw: false };
            }

            console.log('Successfully created the move for the game with id: ' + gameId);
            return { success: result.success, gameId: gameId, player: result.player, moveIndex: result.moveIndex, gameOver: result.gameOver, draw: result.draw };
        } catch (err) {
            console.log(err);
            console.log(err.message);
            return { success: false, gameId: gameId, player: '', moveIndex: '', gameOver: false, draw: false };
        }
    }

    private async getAllByGameId(req: Request, res: Response) {
        console.log('Move controller: get all by game id');

        if (!req.params.gameId) return res.status(400).send('Game id must be provided');

        const result = await this.service.getAllByGameId(req.params.gameId);
        if (!result) {
            console.log('Failed to retrieve moves by game id: ' + req.params.gameId);
            return res.status(500).send('Game id must be provided');
        }

        console.log('Successfully retrieved moves by game id: ' + req.params.gameId);
        return res.status(200).send(result);
    }

    private async getAllByUserId(req: Request, res: Response) {
        console.log('Move controller: get all by user id');

        if (!req.params.userId) return res.status(400).send('User id must be provided');

        const result = await this.service.getAllByUserId(req.params.userId);
        if (!result) {
            console.log('Failed to retrieve moves by user id: ' + req.params.userId);
            return res.status(500).send('User id must be provided');
        }

        console.log('Successfully retrieved moves by user id: ' + req.params.userId);
        return res.status(200).send(result);
    }

    public async computerMove(message: string) {
        console.log('Move controller: WebSocket create computer move');

        if (!message) {
            console.log('Message unavailable');
            return { success: false, gameId: '', player: '', moveIndex: '', gameOver: false };
        }

        const messageParts = message.toString().split(';');
        if (messageParts.length != 3) {
            console.log('Message has wrong length');
            return { success: false, gameId: '', player: '', moveIndex: '', gameOver: false };
        }
        const gameId = messageParts[1];

        const result = await this.service.createComputerMove(gameId);
        if (!result.success) {
            console.log('Failed to create the computer move for the game with id: ' + gameId);
            return { success: false, gameId: gameId, player: '', moveIndex: '', gameOver: false };
        }

        console.log('Successfully created the computer move for the game with id: ' + gameId);
        return { success: result.success, gameId: gameId, player: result.player, moveIndex: result.moveIndex, gameOver: result.gameOver };
    }

    public getRouter(): Router {
        return this.router;
    }
}

const moveController = new MoveController(new MoveService(new MoveRepository(), new GameRepository()));

export default moveController;
