import { User } from "src/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "src/users/dto/users.dtos";
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    createUser(createUserDto: CreateUserDto): Promise<User>;
    validateUser(code: string): Promise<(boolean | User)[] | (number | boolean)[]>;
    getUsers(): Promise<User[]>;
    findUsersById(id: number): Promise<User>;
}
