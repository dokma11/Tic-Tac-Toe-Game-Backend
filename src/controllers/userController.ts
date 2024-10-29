import { Request, Response, Router } from "express";
import { UserService } from "../services/userService";
import { UserRepository } from "../repositories/userRepository";
import {GameRepository} from "../repositories/gameRepository";
const jwt = require('jsonwebtoken');

export class UserController {
    private router: Router;

    constructor(private readonly service: UserService) {
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.get("/email/:email", this.getByEmail.bind(this));
        this.router.get("/profile", this.getProfile.bind(this));
    }

    private async getByEmail(req: Request, res: Response) {
        console.log('User controller: get by email')

        if (!req.params.email) {
            return res.status(400).send('The email must be provided');
        }

        const result = await this.service.getByEmail(req.params.email);
        console.log('Result of get by email: ' + result);

        if (!result) {
            console.log('Failed to retrieve by email!');
            return res.status(500).send('Internal server error: Could not find the user');
        }

        console.log('Successfully retrieved by email!');
        return res.status(200).send({ firstName: result.firstName, lastName: result.lastName, email: result.email }); // proveriti samo da li je ovo dobar return
    }

    private async getProfile(req: Request, res: Response) {
        console.log('User controller: get profile')

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({message: 'Authorization token not found'});

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT as string) as { id: number };

            const result = await this.service.getById(decoded.id.toString());
            const statistics = await this.service.getProfileStatistics(decoded.id.toString());

            if(!result) {
                console.log('Failed to retrieve the user by id: ' + decoded.id.toString());
                return res.status(500).send('Internal server error: Could not retrieve the user by id: ' + decoded.id.toString());
            }

            console.log('Successfully retrieved the user by id: ' + decoded.id.toString())
            return res.status(200).send({firstName: result.firstName, lastName: result.lastName, email: result.email,
                wins: statistics.wins, losses: statistics.losses, draws: statistics.draws, totalPlayed: statistics.totalPlayed });
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

const userController = new UserController(new UserService(new UserRepository, new GameRepository()));

export default userController;
