import { CreateUserDto } from "src/users/dto/users.dtos";
import { UsersService } from "src/users/services/users/users.service";
export declare class UsersController {
    private readonly userService;
    constructor(userService: UsersService);
    getUsers(): Promise<import("../../../typeorm").User[]>;
    findUsersById(id: number): Promise<import("../../../typeorm").User>;
    validateUser(code: number): Promise<void>;
    createUsers(createUserDto: CreateUserDto): Promise<import("../../../typeorm").User>;
}
