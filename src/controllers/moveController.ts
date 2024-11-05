import jwt from 'jsonwebtoken';
import { MoveService } from "../services/moveService";
import { Router, Request, Response } from "express";
import { MoveRepository } from "../repositories/moveRepository";
import { GameRepository } from "../repositories/gameRepository";
import { Move } from "../models/move"; // FIXME: Prebaci u import

export class MoveController {
    private router: Router;

    constructor(private readonly service: MoveService) {
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.get("/game-id/:gameId", this.getAllByGameId.bind(this));
        this.router.get("/user-id/:userId", this.getAllByUserId.bind(this));
    }

    public async handleWebSocketMessage(message: string): Promise<{ success: boolean, gameId: string, player: string,
        moveIndex: string, gameOver: boolean, draw: boolean }> {

        console.log('Move controller: WebSocket create');

        if (!message) {
            console.log('Message unavailable');
            return { success: false, gameId: '', player: '', moveIndex: '', gameOver: false, draw: false };
        }

        const messageParts: string[] = message.toString().split(';');
        if (messageParts.length != 3) {
            console.log('Message has wrong length');
            return { success: false, gameId: '', player: '', moveIndex: '', gameOver: false, draw: false };
        }

        const moveIndex: string =  messageParts[0].split(':')[1];
        const gameId: string = messageParts[1];
        const token: string = messageParts[2].slice(0, -1);

        try {
            const decoded = jwt.verify(token, process.env.JWT as string) as { id: number };

            const result = await this.service.create(moveIndex, gameId, decoded.id.toString());
            if (!result.success) {
                console.log('Failed to create the move for the game with id: ', gameId);
                return { success: false, gameId: gameId, player: '', moveIndex: '', gameOver: false, draw: false };
            }

            console.log('Successfully created the move for the game with id: ', gameId);
            return { success: result.success, gameId: gameId, player: result.player, moveIndex: result.moveIndex, gameOver: result.gameOver, draw: result.draw };
        } catch (err) {
            console.log(err, err.message);
            return { success: false, gameId: gameId, player: '', moveIndex: '', gameOver: false, draw: false };
        }
    }

    private async getAllByGameId(req: Request, res: Response): Promise<Response> {
        console.log('Move controller: get all by game id');

        if (!req.params.gameId) {
            console.log('Error: game id must be provided');
            return res.status(404).send('Game id must be provided');
        }

        const result: Move[] = await this.service.getAllByGameId(req.params.gameId);
        // FIXME: Sto bi ovo bilo 500? Sta ako unesem igru koja ne postoji, onda nije greska servera nego greska korisnika -> 404
        if (!result) {
            console.log('Failed to retrieve moves by game id: ', req.params.gameId);
            return res.status(404).send('Bad request: Game id must be provided');
        }

        console.log('Successfully retrieved moves by game id: ', req.params.gameId);
        return res.status(200).send(result);
    }

    private async getAllByUserId(req: Request, res: Response): Promise<Response> {
        console.log('Move controller: get all by user id');

        if (!req.params.userId) {
            console.log('Error: user id must be provided');
            return res.status(404).send('User id must be provided');
        }

        const result: Move[] = await this.service.getAllByUserId(req.params.userId);
        // FIXME: Sto bi ovo bilo 500? Sta ako unesem korisnika koji ne postoji, onda nije greska servera nego greska korisnika -> 404
        if (!result) {
            console.log('Failed to retrieve moves by user id: ', req.params.userId);
            return res.status(404).send('Bad request: User id must be provided');
        }

        console.log('Successfully retrieved moves by user id: ', req.params.userId);
        return res.status(200).send(result);
    }

    public async computerMove(message: string): Promise<{ success: boolean, gameId: string, player: string, moveIndex: string, gameOver: boolean }> {
        console.log('Move controller: WebSocket create computer move');

        if (!message) {
            console.log('Message unavailable');
            return { success: false, gameId: '', player: '', moveIndex: '', gameOver: false };
        }

        const messageParts: string[] = message.toString().split(';');
        if (messageParts.length != 3) {
            console.log('Message has wrong length');
            return { success: false, gameId: '', player: '', moveIndex: '', gameOver: false };
        }
        const gameId: string = messageParts[1];

        const result = await this.service.createComputerMove(gameId);
        if (!result.success) {
            console.log('Failed to create the computer move for the game with id: ', gameId);
            return { success: false, gameId: gameId, player: '', moveIndex: '', gameOver: false };
        }

        console.log('Successfully created the computer move for the game with id: ', gameId);
        return { success: result.success, gameId: gameId, player: result.player, moveIndex: result.moveIndex, gameOver: result.gameOver };
    }

    public getRouter(): Router {
        return this.router;
    }
}

const moveController = new MoveController(new MoveService(new MoveRepository(), new GameRepository()));

export default moveController;
