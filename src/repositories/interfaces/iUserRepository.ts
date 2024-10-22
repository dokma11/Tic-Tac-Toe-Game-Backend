import { User } from "../../models/user";

export interface IUserRepository {
    getByEmail(email): Promise<User>;
    create(user: User): Promise<User>;
}
