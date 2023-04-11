/// <reference types="multer" />
import { CreateUserDto, BlockUnblock, UpdateUser, Username, FirstConnection, Code } from "src/users/dto/users.dtos";
import { UsersService } from "src/users/providers/users/users.service";
import { AuthService } from 'src/auth/auth.service';
import { BlackFriendList } from "src/typeorm/blackFriendList.entity";
export declare class UsersController {
    private readonly userService;
    private authService;
    constructor(userService: UsersService, authService: AuthService);
    setFa(req: any): Promise<{
        code: number;
        url: null;
    } | {
        code: number;
        url: string;
    }>;
    checkFa(req: any): Promise<void>;
    validFaCode(req: any, body: Code): Promise<{
        valid: boolean;
        username: string;
        token: null;
    } | {
        valid: true;
        username: string;
        token: {
            access_token: string;
        };
    }>;
    fakeLogin(req: any, response: any): Promise<{
        token: {
            access_token: string;
        };
        user_id: any;
        username: any;
    }>;
    checkUpdateUserError(ret_user: any, ret_user2: any, body: any): string[];
    updateUser(req: any, file: Express.Multer.File | undefined, body: UpdateUser): Promise<{
        valid: boolean;
        err: string[];
        username?: undefined;
        token?: undefined;
        img?: undefined;
    } | {
        valid: boolean;
        username: string;
        token: {
            access_token: string;
        };
        img: string | undefined;
        err?: undefined;
    }>;
    uploadFirstLogin(req: any, file: Express.Multer.File | undefined, body: FirstConnection): Promise<{
        valid: boolean;
        err: string[];
        username?: undefined;
        token?: undefined;
    } | {
        valid: boolean;
        username: string;
        token: {
            access_token: string;
        };
        err?: undefined;
    }>;
    uploadFile(req: any, file: Express.Multer.File): {
        path: string;
    };
    getProfile(req: any): Promise<import("../../../typeorm").User | null>;
    firstConnectionProfile(req: any): Promise<import("../../../typeorm").User | null>;
    getUserInfo(req: any, name: Readonly<string>): Promise<any>;
    getFriendBlackListUser(req: any): Promise<BlackFriendList[]>;
    getUsername(req: any): Promise<import("../../../typeorm").User | null>;
    addFriend(req: any, body: Username): Promise<{
        code: number;
        id?: undefined;
        fl?: undefined;
        bl?: undefined;
        User_username?: undefined;
        User_avatarPath?: undefined;
    } | {
        code: number;
        id: number;
        fl: number;
        bl: number;
        User_username: string;
        User_avatarPath: string;
    }>;
    addBlackList(req: any, body: Username): Promise<{
        code: number;
        id?: undefined;
        fl?: undefined;
        bl?: undefined;
        User_username?: undefined;
        User_avatarPath?: undefined;
    } | {
        code: number;
        id: number;
        fl: number;
        bl: number;
        User_username: string;
        User_avatarPath: string;
    }>;
    useBlackFriendList(req: any, body: BlockUnblock): Promise<{
        add: boolean;
        type: null;
    } | {
        add: boolean;
        type: number;
    }>;
    login(req: any, response: any): Promise<{
        token: {
            access_token: string;
        };
        user_id: any;
        username: string;
        fa: boolean;
    }>;
    createUsers(createUserDto: CreateUserDto): Promise<import("../../../typeorm").User>;
    findUsersById(id: number): Promise<import("../../../typeorm").User | {
        userID: number;
        username: string;
        avatarPath: null;
        sstat: {};
    }>;
}
