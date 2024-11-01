import { Request, Response, Router } from "express";
import { UserService } from "../services/userService";
import { UserRepository } from "../repositories/userRepository";
import { GameRepository } from "../repositories/gameRepository";
const jwt = require('jsonwebtoken'); // FIXME: Prebaci u import

export class UserController {
    private router: Router;

    constructor(private readonly service: UserService) {
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.get("/email/:email", this.getByEmail.bind(this));
        this.router.get("/profile", this.getProfile.bind(this));
        this.router.get("/id/:id", this.getById.bind(this));
    }

    private async getByEmail(req: Request, res: Response) {
        console.log('User controller: get by email')

        if (!req.params.email) {
            return res.status(400).send('The email must be provided');
        }

        const result = await this.service.getByEmail(req.params.email);
        // FIXME: 500 znaci da je nesto puklo na serveru, kad se ne pronadje user znaci da ne postoji -> 404
        if (!result) {
            console.log('Failed to retrieve by email!');
            return res.status(500).send('Internal server error: Could not find the user');
        }

        console.log('Successfully retrieved by email!');
        return res.status(200).send({ firstName: result.firstName, lastName: result.lastName, email: result.email });
    }

    private async getById(req: Request, res: Response) {
        console.log('User controller: get by id')

        if (this.checkAuthHeader(req.headers.authorization)) {
            return res.status(401).json({message: 'Authorization token not found'});
        }

        if (!req.params.id) {
            return res.status(400).send('The user id must be provided');
        }

        const result = await this.service.getById(req.params.id);
        // FIXME: 500 znaci da je nesto puklo na serveru, kad se ne pronadje user znaci da ne postoji -> 404
        if (!result) {
            console.log('Failed to retrieve by id!');
            return res.status(500).send('Internal server error: Could not find the user');
        }

        console.log('Successfully retrieved by id!');
        return res.status(200).send({ firstName: result.firstName, lastName: result.lastName, email: result.email });
    }

    private async getProfile(req: Request, res: Response) {
        console.log('User controller: get profile')

        if (this.checkAuthHeader(req.headers.authorization)) {
            return res.status(401).json({message: 'Authorization token not found'});
        }

        const decoded = this.verifyToken(req.headers.authorization.split(' ')[1]);
        if (!decoded) {
            return res.status(401).send('Wrong jwt');
        }

        // FIXME: Get By Id i Get Profile Statistics ti mogu biti jedan query, ako koristis relacione baze onda je dobro da iskoristis njihove mogucnosti + 1 asinhroni poziv ima manje sansi da pukne nego 2 asinhrona poziva
        const statistics = await this.service.getProfileStatistics(decoded.id.toString());
        // FIXME: 500 znaci da je nesto puklo na serveru, kad se ne pronadje user statistika znaci da ne postoji -> 404
        if (!statistics) {
            return res.status(500).send('Internal server error: Could not retrieve profile statistics for user with id: ' + decoded.id.toString());
        }

        const result = await this.service.getById(decoded.id.toString());
        // FIXME: 500 znaci da je nesto puklo na serveru, kad se ne pronadje user znaci da ne postoji -> 404
        if(!result) {
            console.log('Failed to retrieve the user by id: ' + decoded.id.toString());
            return res.status(500).send('Internal server error: Could not retrieve the user by id: ' + decoded.id.toString());
        }

        console.log('Successfully retrieved the user by id: ' + decoded.id.toString())
        return res.status(200).send({firstName: result.firstName, lastName: result.lastName, email: result.email,
            wins: statistics.wins, losses: statistics.losses, draws: statistics.draws, totalPlayed: statistics.totalPlayed });
    }

    private checkAuthHeader(authHeader: string) {
        return (!authHeader || !authHeader.startsWith('Bearer '))
    }

    private verifyToken(token) {
        try {
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

const userController = new UserController(new UserService(new UserRepository, new GameRepository()));

export default userController;
