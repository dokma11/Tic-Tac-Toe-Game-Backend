import { Request, Response, Router } from "express";
import { UserService } from "../services/userService";
import { UserRepository } from "../repositories/userRepository";

export class UserController {
    private router: Router;

    constructor(private readonly service: UserService) {
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.get("/email/:email", this.getByEmail.bind(this));
    }

    private async getByEmail(req: Request, res: Response) {
        console.log('User controller: get by email')

        if (!req.params.email) {
            res.status(400).send('The email must be provided');
        }

        const result = await this.service.getByEmail(req.params.email);
        console.log('Result of get by email: ' + result);

        if (result) {
            console.log('Successfully retrieved by email!');
            res.status(200).send({ firstName: result.firstName, lastName: result.lastName, email: result.email }); // proveriti samo da li je ovo dobar return
        } else {
            console.log('Failed to retrieve by email!');
            res.status(500).send('Internal server error: Could not find the user');
        }

    }

    public getRouter(): Router {
        return this.router;
    }
}

const userController = new UserController(new UserService(new UserRepository));

export default userController;
