import { User } from "../../models/user";

export interface IUserRepository {
    getByEmail(email: string): Promise<User>;
    create(user: User): Promise<User>;
    getById(id: string): Promise<User>;
}
