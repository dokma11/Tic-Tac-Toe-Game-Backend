import bcrypt from "bcrypt";
import { IUserRepository } from "../repositories/interfaces/iUserRepository";
import { IGameRepository } from "../repositories/interfaces/iGameRepository";
import { User } from "../models/user";
import { Game } from "../models/game";

export class UserService {
    private repository: IUserRepository;
    private gameRepository: IGameRepository;

    constructor(private readonly userRepository: IUserRepository, private readonly gRepository: IGameRepository) {
        this.repository = userRepository;
        this.gameRepository = gRepository;
    }

    public async getByEmail(email: string): Promise<User> {
        console.log('User service: get by email')

        const user: User = await this.repository.getByEmail(email);
        if (!user) {
            console.log('Error: could not get the user by email: ', email);
            return null;
        }
        return user;
    }

    public async getById(id: string): Promise<User> {
        console.log('User service: get by id')

        const user: User = await this.repository.getById(id);
        if (!user) {
            console.log('Error: could not get the user by id: ', id);
            return null;
        }
        return user;
    }

    // FIXME: parametar mora imati tip i return type dodati
    public async login(reqBody: { email: string, password: string }): Promise<{ success: boolean, id: number }> {
        console.log('User service: login')

        const user: User = await this.repository.getByEmail(reqBody.email);
        if (!user) {
            console.log('Error: could not get the user by email: ', reqBody.email);
            return { success: false, id: null }
        }

        const isPasswordValid: boolean = await bcrypt.compare(reqBody.password, user.password)
        if (!isPasswordValid) {
            console.log('Error: password is not valid')
            return { success: false, id: null };
        }

        return { success: true, id: user.id };
    }

    public async create(newUser: User): Promise<{ success: boolean, user: User }> {
        console.log('User service: create')

        const existingUser: User = await this.repository.getByEmail(newUser.email);
        if (existingUser) {
            console.log('Error: the user already exists: ', newUser.email);
            return { success: false, user: null }
        }

        const user = {
            id: -10,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            password: newUser.password,
        }

        try {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        } catch (e) {
            console.error(e, e.message);
            throw e;
        }

        const result: User = await this.repository.create(user);
        if (!result) {
            console.log('Error: could not create a new user');
            return { success: false, user: null };
        }
        return { success: true, user: result };
    }

    public async getProfileStatistics(userId: string): Promise<{ user: User, wins: number, losses: number, totalPlayed: number, draws: number }> {
        console.log('User service: get profile statistics');

        const user: User = await this.repository.getById(userId);
        if (!user) {
            console.log('Error: could not get the user by id: ', userId);
            return null;
        }

        const totalGames: Game[] = await this.gameRepository.getAllByPlayerId(userId);
        if (!totalGames) {
            console.log('Error: could not fetch total games for user id: ', userId);
            return { user: null, wins: 0, losses: 0, totalPlayed: 0, draws: 0 };
        }

        const wonGames: Game[] = totalGames.filter((game: Game): boolean => game.winnerId === parseInt(userId));
        const lostGames: Game[] = totalGames.filter((game: Game): boolean => game.loserId === parseInt(userId));

        return { user: user, wins: wonGames.length, losses: lostGames.length, totalPlayed: totalGames.length,
            draws: (totalGames.length - (wonGames.length + lostGames.length)) };
    }
}
