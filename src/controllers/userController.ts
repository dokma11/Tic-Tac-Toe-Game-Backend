import jwt from 'jsonwebtoken';
import { Request, Response, Router } from "express";
import { UserService } from "../services/userService";
import { UserRepository } from "../repositories/userRepository";
import { GameRepository } from "../repositories/gameRepository";
import { User } from "../models/user";

export class UserController {
    private router: Router;

    constructor(private readonly service: UserService) {
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.get("/email/:email", this.getByEmail.bind(this));
        this.router.get("/profile", this.getProfile.bind(this));
        this.router.get("/id/:id", this.getById.bind(this));
    }

    private async getByEmail(req: Request, res: Response): Promise<Response> {
        console.log('User controller: get by email')

        if (!req.params.email) {
            console.log('Error: The email must be provided');
            return res.status(400).send('The email must be provided');
        }

        const result: User = await this.service.getByEmail(req.params.email);
        if (!result) {
            console.log('Failed to retrieve by email!');
            return res.status(404).send('Bad request: Could not find the user');
        }

        console.log('Successfully retrieved by email!');
        return res.status(200).send({ firstName: result.firstName, lastName: result.lastName, email: result.email });
    }

    private async getById(req: Request, res: Response): Promise<Response> {
        console.log('User controller: get by id')

        if (this.checkAuthHeader(req.headers.authorization)) {
            console.log('Error: Authorization token not found');
            return res.status(401).json({message: 'Authorization token not found'});
        }

        if (!req.params.id) {
            console.log('Error: The user id must be provided');
            return res.status(400).send('The user id must be provided');
        }

        const result: User = await this.service.getById(req.params.id);
        if (!result) {
            console.log('Failed to retrieve by id!');
            return res.status(404).send('Bad request: Could not find the user');
        }

        console.log('Successfully retrieved by id!');
        return res.status(200).send({ firstName: result.firstName, lastName: result.lastName, email: result.email });
    }

    private async getProfile(req: Request, res: Response): Promise<Response> {
        console.log('User controller: get profile')

        if (this.checkAuthHeader(req.headers.authorization) || typeof req.headers.authorization !== 'string') {
            console.log('Error: Authorization token not found');
            return res.status(401).json({message: 'Authorization token not found'});
        }

        const decoded: {id: number} = this.verifyToken(req.headers.authorization.split(' ')[1]);
        if (!decoded) {
            console.log('Error: Wrong jwt');
            return res.status(401).send('Wrong jwt');
        }

        const result = await this.service.getProfileStatistics(decoded.id.toString());
        if (!result) {
            console.log('Error: Could not retrieve the statistics');
            return res.status(404).send('Bad request: Could not retrieve profile statistics for user with id: ' + decoded.id.toString());
        }

        console.log('Successfully retrieved the user by id: ', decoded.id.toString())
        return res.status(200).send({firstName: result.user.firstName, lastName: result.user.lastName, email: result.user.email,
            wins: result.wins, losses: result.losses, draws: result.draws, totalPlayed: result.totalPlayed });
    }

    private checkAuthHeader(authHeader: string): boolean {
        return (!authHeader || !authHeader.startsWith('Bearer '))
    }

    private verifyToken(token: string): { id: number } {
        try {
            return jwt.verify(token, process.env.JWT as string) as { id: number };
        } catch (err) {
            console.log(err, err.message);
            return null;
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}

const userController = new UserController(new UserService(new UserRepository, new GameRepository()));

export default userController;
