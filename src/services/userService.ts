import { IUserRepository } from "../repositories/interfaces/iUserRepository";
import { User } from "../models/user";
import { IGameRepository } from "../repositories/interfaces/iGameRepository";
const bcrypt = require("bcrypt");

export class UserService {
    private repository: IUserRepository;
    private gameRepository: IGameRepository;

    constructor(private readonly userRepository: IUserRepository, private readonly gRepository: IGameRepository) {
        this.repository = userRepository;
        this.gameRepository = gRepository;
    }

    public async getByEmail(email: string): Promise<User> {
        console.log('User service: get by email')
        return await this.repository.getByEmail(email);
    }

    public async getById(id: string): Promise<User> {
        console.log('User service: get by id')
        return await this.repository.getById(id);
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

    public async getProfileStatistics(userId: string) {
        console.log('User service: get profile statistics');

        const wonGames = await this.gameRepository.getAllByWinnerId(userId);
        if (!wonGames) {
            console.log('Error: could not fetch won games for user id: ' + userId);
            return { wins: 0, losses: 0, totalPlayed: 0, draws: 0 };
        }

        const lostGames = await this.gameRepository.getAllByLoserId(userId);
        if (!lostGames) {
            console.log('Error: could not fetch lost games for user id: ' + userId);
            return { wins: 0, losses: 0, totalPlayed: 0, draws: 0 };
        }

        const totalGames = await this.gameRepository.getAllByPlayerId(userId);
        if (!totalGames) {
            console.log('Error: could not fetch total games for user id: ' + userId);
            return { wins: 0, losses: 0, totalPlayed: 0, draws: 0 };
        }

        return { wins: wonGames.length, losses: lostGames.length, totalPlayed: totalGames.length,
            draws: (totalGames.length - (wonGames.length + lostGames.length)) };
    }
}
