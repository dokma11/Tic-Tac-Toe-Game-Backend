import { Request, Response, Router } from "express";
import { GameService } from "../services/gameService";
import { GameRepository } from "../repositories/gameRepository";
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';
import { WebSocketService } from "../config/webSocket";
import { webSocketService } from "../app";

dotenv.config();

export class GameController {
    private router: Router;
    private webSocketService: WebSocketService;

    constructor(private readonly service: GameService, private readonly wss: WebSocketService) {
        this.router = Router();
        this.setupRoutes();
        if (wss) {
            this.webSocketService = wss;
        }
    }

    private setupRoutes() {
        this.router.post("/", this.create.bind(this));
        this.router.get("/id/:id", this.getById.bind(this));
        this.router.get("/public-id/:publicId", this.getByPublicId.bind(this));
        this.router.put("/join/:publicId", this.join.bind(this));
        this.router.put("/cancel/:publicId", this.cancel.bind(this));
    }

    private async create(req: Request, res: Response) {
        console.log('Game controller: create')

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({message: 'Authorization token not found'});

        if (!req.body.type) return res.status(400).send('Game type must be defined');

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT as string) as { id: number };

            const result = await this.service.create(req.body.type, decoded.id.toString());

            if(!result) {
                console.log('Failed to create a new game!');
                return res.status(500).send('Internal server error: Could not create a new game' );
            }

            console.log('Successfully created a new game')
            return res.status(200).send({publicId: result.publicId, status: result.status, type: result.type});
        } catch (err) {
            console.log(err);
            console.log(err.message);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
    }

    private async getById(req: Request, res: Response) {
        console.log('Game controller: get by id')

        if(!req.params.id) {
            return res.status(400).send('Id must be provided');
        }

        const result = await this.service.getById(req.params.id);
        console.log('Result of get by id: ' + result);

        if (!result) {
            console.log('Failed to retrieve by id!');
            return res.status(500).send('Internal server error: Could not find the game by id: ' + req.params.id);
        }

        console.log('Successfully retrieved by id!');
        return res.status(200).send(result);
    }

    // ovo ce mi biti potrebno za sam history neke partije, moracu da dobavim i poteze korisnika sve
    private async getByPublicId(req: Request, res: Response) {
        console.log('Game controller: get by public id')

        if(!req.params.publicId || req.params.publicId.length != 9 || !parseInt(req.params.publicId)) {
            return res.status(400).send('Invalid public id provided');
        }

        const result = await this.service.getByPublicId(req.params.publicId);
        console.log('Result of get by public id: ' + result);

        if (!result) {
            console.log('Failed to retrieve by public id!');
            return res.status(500).send('Internal server error: Could not find the game by public id' );
        }

        console.log('Successfully retrieved by public id!');
        return res.status(200).send({publicId: result.publicId, status: result.status, type: result.type, xPlayerId: result.xPlayerId, yPlayerId: result.yPlayerId});
    }

    private async join(req: Request, res: Response) {
        const authHeader = req.headers.authorization;

        if (!req.params.publicId) return res.status(400).send('Public id of the game must be provided');

        if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({message: 'Authorization token not found'});

        const token = authHeader.split(' ')[1];
        try {
            console.log('Game controller: join');

            const decoded = jwt.verify(token, process.env.JWT as string) as { id: number };

            const result = await this.service.join(req.params.publicId, decoded.id.toString());

            if (!result) {
                console.log('Failed to join the game with public id: ' + req.params.publicId);
                return res.status(500).send('Internal server error: Could not join the game by public id' + req.params.publicId);
            }

            console.log('Successfully joined the game with public id: ' + req.params.publicId);
            this.webSocketService.broadcastMessage('join request for game with public id: ' + req.params.publicId);
            return res.status(200).send();
        } catch (err) {
            console.log(err);
            console.log(err.message);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
    }

    private async cancel(req: Request, res: Response) {
        console.log('Game controller: cancel');
        const authHeader = req.headers.authorization;

        if (!req.params.publicId) return res.status(400).send('Public id of the game must be provided');

        if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({message: 'Authorization token not found'});

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT as string) as { id: number };

            const result = await this.service.cancel(req.params.publicId, decoded.id.toString());

            if (!result) {
                console.log('Failed to cancel the game with public id: ' + req.params.publicId);
                return res.status(500).send('Internal server error: Could not cancel the game by public id' + req.params.publicId);
            }

            console.log('Successfully cancelled the game with public id: ' + req.params.publicId);
            return res.status(200).send();
        } catch (err) {
            console.log(err);
            console.log(err.message);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
    }

    public getRouter(): Router {
        return this.router;
    }

}

const gameController = new GameController(new GameService(new GameRepository), webSocketService);

export default gameController;
