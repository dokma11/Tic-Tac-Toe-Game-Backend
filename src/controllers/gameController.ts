import { Request, Response, Router } from "express";
import { GameService } from "../services/gameService";
import { GameRepository } from "../repositories/gameRepository";
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';
import { WebSocketService } from "../config/webSocket";
import { webSocketService } from "../app";

// configure .env variables
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
        this.router.get("/history/:publicId", this.getHistoryByPublicId.bind(this));
        this.router.get("/finished", this.getAllFinishedByPlayerId.bind(this));
    }

    private async create(req: Request, res: Response) {
        console.log('Game controller: create')

        if (this.checkAuthHeader(req.headers.authorization)) {
            return res.status(401).json({message: 'Authorization token not found'});
        }

        if (!req.body.type) {
            return res.status(400).send('Game type must be defined');
        }

        const decoded = this.verifyToken(req.headers.authorization.split(' ')[1]);
        if (!decoded) {
            return res.status(401).send('Wrong jwt');
        }

        const result = await this.service.create(req.body.type, decoded.id.toString());
        if(!result) {
            console.log('Failed to create a new game!');
            return res.status(500).send('Internal server error: Could not create a new game' );
        }

        console.log('Successfully created a new game')
        return res.status(200).send({publicId: result.publicId, status: result.status, type: result.type});
    }

    private async getById(req: Request, res: Response) {
        console.log('Game controller: get by id')

        if(!req.params.id) {
            return res.status(400).send('Id must be provided');
        }

        const result = await this.service.getById(req.params.id);
        if (!result) {
            console.log('Failed to retrieve by id!');
            return res.status(500).send('Internal server error: Could not find the game by id: ' + req.params.id);
        }

        console.log('Successfully retrieved by id!');
        return res.status(200).send(result);
    }

    private async getByPublicId(req: Request, res: Response) {
        console.log('Game controller: get by public id')

        if(!req.params.publicId || req.params.publicId.length != 9 || !parseInt(req.params.publicId))  {
            return res.status(400).send('Invalid public id provided');
        }

        const result = await this.service.getByPublicId(req.params.publicId);
        if (!result) {
            console.log('Failed to retrieve by public id!');
            return res.status(500).send('Internal server error: Could not find the game by public id' );
        }

        console.log('Successfully retrieved by public id!');
        return res.status(200).send({publicId: result.publicId, status: result.status, type: result.type, xPlayerId: result.xPlayerId, yPlayerId: result.yPlayerId});
    }

    private async getHistoryByPublicId(req: Request, res: Response) {
        console.log('Game controller: get history by public id')

        if(!req.params.publicId || req.params.publicId.length != 9 || !parseInt(req.params.publicId)) {
            return res.status(400).send('Invalid public id provided');
        }

        const result = await this.service.getHistoryByPublicId(req.params.publicId);
        if (!result) {
            console.log('Failed to retrieve by public id!');
            return res.status(500).send('Internal server error: Could not find the game by public id' );
        }

        console.log('Successfully retrieved history by public id!');
        return res.status(200).send({ publicId: result.publicId, status: result.status, type: result.type,
            xPlayerId: result.xPlayerId, yPlayerId: result.yPlayerId, moves: result.moves, winnerId: result.winnerId, loserId: result.loserId });
    }

    private async join(req: Request, res: Response) {
        console.log('Game controller: join')

        if (this.checkAuthHeader(req.headers.authorization)) {
            return res.status(401).json({message: 'Authorization token not found'});
        }

        if (!req.params.publicId) {
            return res.status(400).send('Public id of the game must be provided');
        }

        const decoded = this.verifyToken(req.headers.authorization.split(' ')[1]);
        if (!decoded) {
            return res.status(401).send('Wrong jwt');
        }

        const result = await this.service.join(req.params.publicId, decoded.id.toString());
        if (!result) {
            console.log('Failed to join the game with public id: ' + req.params.publicId);
            return res.status(500).send('Internal server error: Could not join the game by public id' + req.params.publicId);
        }

        console.log('Successfully joined the game with public id: ' + req.params.publicId);
        this.webSocketService.broadcastMessage('join request for game with public id: ' + req.params.publicId);
        return res.status(200).send();
    }

    private async cancel(req: Request, res: Response) {
        console.log('Game controller: cancel');

        if (this.checkAuthHeader(req.headers.authorization)) {
            return res.status(401).json({message: 'Authorization token not found'});
        }

        if (!req.params.publicId) {
            return res.status(400).send('Public id of the game must be provided');
        }

        const decoded = this.verifyToken(req.headers.authorization.split(' ')[1]);
        if (!decoded) {
            return res.status(401).send('Wrong jwt');
        }

        const result = await this.service.cancel(req.params.publicId, decoded.id.toString());
        if (!result) {
            console.log('Failed to cancel the game with public id: ' + req.params.publicId);
            return res.status(500).send('Internal server error: Could not cancel the game by public id' + req.params.publicId);
        }

        console.log('Successfully cancelled the game with public id: ' + req.params.publicId);
        return res.status(200).send();
    }

    private async getAllFinishedByPlayerId(req: Request, res: Response) {
        console.log('Game controller: get all finished by player id');

        if (this.checkAuthHeader(req.headers.authorization)) {
            return res.status(401).json({message: 'Authorization token not found'});
        }

        const decoded = this.verifyToken(req.headers.authorization.split(' ')[1]);
        if (!decoded) {
            return res.status(401).send('Wrong jwt');
        }

        const result = await this.service.getAllFinishedByPlayerId(decoded.id.toString());
        if (!result) {
            console.log('Failed to retrieve all the finished games with player id: ' + decoded.id.toString());
            return res.status(500).send('Internal server error: Could not retrieve all the games by player id' + decoded.id.toString());
        }

        console.log('Successfully retrieved all the games with player id: ' + decoded.id.toString());
        return res.status(200).send(result);
    }

    private checkAuthHeader(authHeader: string) {
        console.log('authHeader')
        console.log(authHeader)
        return (!authHeader || !authHeader.startsWith('Bearer '))
    }

    private verifyToken(token) {
        try {
            console.log('token');
            console.log(token);
            return jwt.verify(token, process.env.JWT as string) as { id: number };
        } catch (err) {
            console.log(err);
            console.log(err.message);
            return null;
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}

const gameController = new GameController(new GameService(new GameRepository), webSocketService);

export default gameController;
