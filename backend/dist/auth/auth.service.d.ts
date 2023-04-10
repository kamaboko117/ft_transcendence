import { UsersService } from 'src/users/providers/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokenUser } from 'src/chat/chat.interface';
export declare class AuthService {
    private usersServices;
    private jwtService;
    constructor(usersServices: UsersService, jwtService: JwtService);
    validateUser(code: string): Promise<any>;
    fakeUser(): Promise<any>;
    login(user: TokenUser): Promise<{
        access_token: string;
    }>;
    verifyFirstToken(token: string): Promise<false | import("../typeorm").User | null | undefined>;
    verifyToken(token: string): Promise<false | import("../typeorm").User | null | undefined>;
    refresh(user: TokenUser): Promise<{
        refresh_token: string;
    }>;
}
