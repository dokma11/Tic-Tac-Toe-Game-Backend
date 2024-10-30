import { IUserRepository } from "./interfaces/iUserRepository";
import { prisma } from "../config/database";
import { User } from "../models/user";
import { handleDbOperation } from '../middlewares/databaseOperations';

export class UserRepository implements IUserRepository  {
    constructor() { }

    public async getByEmail(email: string): Promise<User> {
        console.log('User repository: get by email');
        return handleDbOperation(
            () => prisma.user.findUnique({
                where: {
                    email: email,
                },
            }),
            'Could not get the user by email'
        );
    }

    public async create(user: User): Promise<User> {
        console.log('User repository: create');
        return handleDbOperation(
            () => prisma.user.create({
                data: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password,
                }
            }),
            'Could not create a user'
        );
    }

    public async getById(id: string): Promise<User> {
        console.log('User repository: get by id');
        return handleDbOperation(
            () => prisma.user.findUnique({
                where: {
                    id: parseInt(id)
                }
            }),
            'Could not get the user by id'
        );
    }
}
