import { User } from "src/typeorm";
import { DataSource, Repository } from "typeorm";
import { CreateUserDto } from "src/users/dto/users.dtos";
import { Stat } from "src/typeorm/stat.entity";
import { BlackFriendList } from "src/typeorm/blackFriendList.entity";
export declare class UsersService {
    private readonly userRepository;
    private readonly statRepository;
    private readonly blFrRepository;
    private dataSource;
    constructor(userRepository: Repository<User>, statRepository: Repository<Stat>, blFrRepository: Repository<BlackFriendList>, dataSource: DataSource);
    createUser(createUserDto: CreateUserDto): Promise<User>;
    getToken(code: string): Promise<{
        access_token: string;
        refresh_token: string;
    } | undefined>;
    getInformationBearer(token: {
        access_token: string;
        refresh_token: string;
    }): Promise<number>;
    getUsers(): Promise<User[]>;
    updatePathAvatarUser(user_id: number, path: string): Promise<void>;
    updateUsername(user_id: number, username: string): Promise<void>;
    update2FA(user_id: number, fa: boolean, secret: string | null): Promise<void>;
    update2FaPsw(user_id: number, psw: string): Promise<void>;
    updateFaFirstEntry(user_id: number): Promise<void>;
    getUserProfile(id: number): Promise<User | null>;
    findUsersById(id: number): Promise<User | null>;
    findUserByIdForGuard(id: number): Promise<User | null>;
    getUserFaSecret(id: number): Promise<User | null>;
    findUserByName(username: string): Promise<User | null>;
    searchUserInList(ownerId: number, focusId: number, type: number): Promise<BlackFriendList | null>;
    getFriendList(user_id: number): Promise<any[]>;
    focusUserBlFr(ownerId: number, focusId: number): Promise<any>;
    getBlackFriendListBy(user_id: number): Promise<any[]>;
    findBlFr(ownerId: number, focusUserId: number, type: number): Promise<BlackFriendList | null>;
    insertBlFr(ownerId: number, focusUserId: number, type: number): Promise<void>;
    deleteBlFr(ownerId: number, focusUserId: number, type: number, findId: number): Promise<void>;
}
