import { IUserRepository } from "../repositories/interfaces/iUserRepository";
import { User } from "../models/user";
const bcrypt = require("bcrypt");

export class UserService {
    private repository: IUserRepository;

    constructor(private readonly userRepository: IUserRepository) {
        this.repository = userRepository;
    }

    public async getByEmail(email: string): Promise<User> {
        console.log('User service: get by email')
        return await this.repository.getByEmail(email);
    }

    public async login(reqBody) {
        console.log('User service: login')
        const user = await this.repository.getByEmail(reqBody.email);

        const isPasswordValid = await bcrypt.compare(reqBody.password, user.password)
        if (!isPasswordValid) return { success: false, id: -1 };

        return { success: true, id: user.id };
    }

    public async create(newUser: User) {
        console.log('User service: create')
        const existingUser = await this.repository.getByEmail(newUser.email);
        if (existingUser) return { success: false, user: null }

        const user = {
            id: -10,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            password: newUser.password,
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        const result = await this.repository.create(user);
        return { success: true, user: result };
    }


}
