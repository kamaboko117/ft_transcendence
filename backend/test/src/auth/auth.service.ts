import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { TokenUser } from 'src/chat/chat.interface';

type User = {
    userID: any,
    token: string,
    username: string
}

@Injectable()
export class AuthService {
    constructor(private usersServices: UsersService,
        private jwtService: JwtService) { }
    /* find or create user from 42 API */
    async validateUser(code: string) {
        const token: { access_token: string, refresh_token: string } | undefined = await this.usersServices.getToken(code);
        if (typeof token === "undefined")
            return (undefined);
        const iduser: number = await this.usersServices.getInformationBearer(token);
        let user: any = await this.usersServices.findUsersById(iduser);

        if (!user)
            user = await this.usersServices.createUser({ userID: iduser, username: '', token: '' });
        return (user);
	}
	/* create fake user */
	async fakeUser() {
		const iduser: number = Math.ceil(Math.random() * 9452160 + 1000000);
        const user = await this.usersServices.createUser({ userID: iduser, username: iduser.toString(), token: '' });
        console.log(user);
        return (user);
    }


    /* then log user, returning a Json web token */
    async login(user: TokenUser) {
        const payload = {
            sub: user.userID,
            token: user.token,
            username: user.username,
            fa: user.fa
        }
        console.log("payload");
        console.log(payload);
        const access_token = { access_token: this.jwtService.sign(payload) };
        return (access_token);
    }

    async verifyToken(token: string) {
        console.log("TOK: " + token);
        try {
            const decoded = this.jwtService.verify(token, { secret: process.env.AUTH_SECRET });
            const userExistInDb: User | null = await this.usersServices.findUsersById(decoded.sub)
            
            return (userExistInDb);
        } catch (e) {
            return (false);
        }
    }

    async refresh(user: TokenUser) {
        const payload = {
            sub: user.userID,
            token: user.token,
            username: user.username,
            fa: user.fa
        }
        console.log("refresh payload");
        console.log(payload);
        const refresh_token = {
            refresh_token: this.jwtService.sign(payload, { expiresIn: '500s' })
        };
        return (refresh_token);
    }
}
