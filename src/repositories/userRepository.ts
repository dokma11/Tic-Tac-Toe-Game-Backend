import { IUserRepository } from "./interfaces/iUserRepository";
import { prisma } from "../config/database";
import { User } from "../models/user";

export class UserRepository implements IUserRepository  {
    constructor() { }

    public async getByEmail(email: string): Promise<User> {
        console.log('User repository: get by email');

        return await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
    }

    public async create(user: User): Promise<User> {
        console.log('User repository: create');

        return await prisma.user.create({
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
            }
        });
    }

    public async getById(id: string): Promise<User> {
        console.log('User repository: get by id');

        return await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        })
    }
}
