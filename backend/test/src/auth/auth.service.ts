import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/services/users/users.service';
import { JwtService } from '@nestjs/jwt';

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
        console.log("iduser: " + iduser);
        let user: any = await this.usersServices.findUsersById(iduser);
        if (!user)
            user = await this.usersServices.createUser({ userID: iduser, username: '', token: '' });
        console.log(user);
        return (user);
    }
    /* then log user, returning a Json web token */
    async login(user: User) {
        const payload = {
            sub: user.userID,
            token: user.token,
            username: user.username
        }
        console.log("payload");
        console.log(payload);
        const access_token = { access_token: this.jwtService.sign(payload) };
        return (access_token);
    }
    async verifyToken(token: string, request: any) {
        console.log("TOK: " + token);
        try {
            this.jwtService.verify(token, { secret: process.env.AUTH_SECRET })
        } catch (e) {
            console.log(request.cookies.refresh_token)
            if (typeof e.expiredAt != "undefined"
                && typeof request.cookies.refresh_token != "undefined") {
                //use refresh token to get new access
                console.log("error cookie");
                console.log("cookie defined");
                console.log(request.cookies.refresh_token);//y a des cookies adminer
                console.log("---");
                console.log("check refresh token");
                this.jwtService.verify(request.cookies.refresh_token, {
                    secret: process.env.AUTH_SECRET,
                })
            }
            else {
                console.log(e);
                throw new UnauthorizedException("Access not authorized.");
            }
        }
    }
    async refresh(user: User) {
        const payload = {
            sub: user.userID,
            token: user.token,
            username: user.username
        }
        console.log("refresh payload");
        console.log(payload);
        const refresh_token = {
            refresh_token: this.jwtService.sign(payload, {
                expiresIn: 120
            })
        }
        return (refresh_token);
    }
}
