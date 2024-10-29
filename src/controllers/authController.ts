import { Router, Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';
import { UserRepository } from "../repositories/userRepository";
import {GameRepository} from "../repositories/gameRepository";

dotenv.config();

export class AuthController {
    private router: Router;

    constructor(private readonly service: UserService) {
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.post("/login/", this.login.bind(this));
        this.router.post("/register/", this.register.bind(this));
    }

    private async login(req: Request, res: Response) {
        console.log('Auth controller: login')

        if (!this.validate(req.body.email, req.body.password)) {
            console.log('Auth controller: invalid email and password combination');
            return res.status(400).send('Invalid email and password combination');
        }

        const result = await this.service.login(req.body);
        if (!result.success) {
            console.log('Failed to logn in with those credentials!');
            return res.status(400).send('Invalid email and password combination');
        }

        console.log('Successfully logged in  with those credentials!');
        const token = jwt.sign({ id: result.id }, process.env.JWT as string) // mozda ovde da dodam neki mejl ili slicno, zavisi sta mi treba na frontu
        return res.send(token);
    }

    private async register(req: Request, res: Response) {
        console.log('Auth controller: register')

        if (!this.validate(req.body.email, req.body.password)) {
            console.log('Auth controller: invalid email and password combination');
            return res.status(400).send('Invalid email and password combination');
        }

        const result = await this.service.create(req.body);

        if(!result.success) {
            console.log('Failed to register a new user!');
            return res.status(400).send('A user with this email already exists');
        }

        console.log('Successfully registered a new user!');
        const token = jwt.sign({ id: result.user.id }, process.env.JWT as string); // mozda ovde da dodam neki mejl ili slicno, zavisi sta mi treba na frontu
        return res.header('x-auth-token', token).send({ firstName: result.user.firstName, lastName: result.user.lastName, email: result.user.email });
    }

    // mozda izdvojiti posebno za registraciju i takodje pitanje da li da validacija bude u kontroleru ili da bude u servisu
    private validate(email: string, password: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!email || !email.match(emailRegex)) {
            console.log('Invalid email!');
            return false;
        }

        if (!password || password.length < 6) {
            console.log('Password must be at least 6 characters long');
            return false;
        }

        return true;
    }

    public getRouter(): Router {
        return this.router;
    }
}

const authController = new AuthController(new UserService(new UserRepository, new GameRepository()));

export default authController;
