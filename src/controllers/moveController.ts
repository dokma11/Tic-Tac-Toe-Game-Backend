import { MoveService } from "../services/moveService";
import { Router, Request, Response } from "express";
import { MoveRepository } from "../repositories/moveRepository";
const jwt = require('jsonwebtoken');

// vrlo moguce da ce se ova klasa sa resta prebacivati na veb sokete
export class MoveController {
    private router: Router;

    constructor(private readonly service: MoveService) {
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.get("/game-id/:gameId", this.getAllByGameId.bind(this));
        this.router.get("/user-id/:userId", this.getAllByUserId.bind(this));
        this.router.get("/latest/:gameId", this.getLatest.bind(this));
        this.router.post("/", this.create.bind(this));
    }

    // create is basically equivalent of making a move on the board
    private async create(req: Request, res: Response) {
        console.log('Move controller: create')

        const authHeader = req.headers.authorization;

        if (!req.params.gameId) return res.status(400).send('Game id for the corresponding move must be provided');

        if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({message: 'Authorization token not found'});

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT as string) as { id: number };

            const result = await this.service.create(req.body, decoded.id.toString()); // ovde saljem samo telo (potez) i id korisnika uzimam iz bearera sa servera

            if (!result) {
                console.log('Failed to create the move fot the game with id: ' + req.params.gameId);
                res.status(500).send('Internal server error: Could not create the move for the game with id: ' + req.params.gameId);
            }

            console.log('Successfully created the move for the game with id: ' + req.params.gameId);
            res.status(200).send();
        } catch (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
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

    private async getLatest(req: Request, res: Response) {
        console.log('Move controller: get the latest move by game id');

        if (!req.params.gameId) return res.status(400).send('Game id must be provided');

        const result = await this.service.getLatest(req.params.gameId);

        if (!result) {
            console.log('Failed to retrieve the latest move by game id: ' + req.params.gameId);
            return res.status(500).send('Game id must be provided');
        }

        console.log('Successfully retrieved the latest move by game id: ' + req.params.gameId);
        return res.status(200).send(result);
    }

    public getRouter(): Router {
        return this.router;
    }
}

const moveController = new MoveController(new MoveService(new MoveRepository()));

export default moveController;
