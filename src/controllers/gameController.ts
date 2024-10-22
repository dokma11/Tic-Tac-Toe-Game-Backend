import { Request, Response, Router } from "express";
import { GameService } from "../services/gameService";
import { GameRepository } from "../repositories/gameRepository";
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';

dotenv.config();

export class GameController {
    private router: Router;

    constructor(private readonly service: GameService) {
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.post("/", this.create.bind(this));
        this.router.get("/id/:id", this.getById.bind(this));
        this.router.get("/public-id/:publicId", this.getByPublicId.bind(this));
        this.router.post("/join/:publicId", this.join.bind(this));
    }

    private async create(req: Request, res: Response) {
        console.log('Game controller: create')

        if (!req.body.xPlayerId || !req.body.type) {
            return res.status(400).send('Game type and the game creator must be defined');
        }

        const result = await this.service.create(req.body);

        if(result) {
            console.log('Successfully created a new game')
            return res.status(200).send({publicId: result.publicId, status: result.status, type: result.type});
        } else {
            console.log('Failed to create a new game!');
            return res.status(500).send('Internal server error: Could not create a new game' );
        }
    }

    private async getById(req: Request, res: Response) {
        console.log('Game controller: get by id')

        if(!req.params.id) {
            return res.status(400).send('Id must be provided');
        }

        const result = await this.service.getById(req.params.id);
        console.log('Result of get by id: ' + result);

        if (result) {
            console.log('Successfully retrieved by id!');
            res.status(200).send(result);
        } else {
            console.log('Failed to retrieve by id!');
            res.status(500).send('Internal server error: Could not find the game by id' );
        }
    }

    private async getByPublicId(req: Request, res: Response) {
        console.log('Game controller: get by public id')

        if(!req.params.publicId) {
            return res.status(400).send('Public id must be provided');
        }

        const result = await this.service.getByPublicId(req.params.publicId);
        console.log('Result of get by public id: ' + result);

        if (result) {
            console.log('Successfully retrieved by public id!');
            res.status(200).send({publicId: result.publicId, status: result.status, type: result.type}); // vratitit se samo da se proveri da li valja
        } else {
            console.log('Failed to retrieve by public id!');
            res.status(500).send('Internal server error: Could not find the game by public id' );
        }
    }

    private async join(req: Request, res: Response) {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                console.log('Game controller: join');

                const decoded = jwt.verify(token, process.env.JWT as string) as { id: number };

                const result = await this.service.join(req.params.publicId, decoded.id.toString());

                if (result) {
                    console.log('Successfully joined the game with public id: ' + req.params.publicId);
                    res.status(200).send();
                } else {
                    console.log('Failed to join the game with public id: ' + req.params.publicId);
                    res.status(500).send('Internal server error: Could not join the game by public id' + req.params.publicId);
                }
            } catch (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
        } else {
            return res.status(401).json({ message: 'Authorization token not found' });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}

const gameController = new GameController(new GameService(new GameRepository));

export default gameController;
