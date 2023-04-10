import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokenUser } from 'src/chat/chat.interface';

@Injectable()
export class AuthService {
    constructor(private usersServices: UsersService,
        private jwtService: JwtService) { }
    /* find or create user from 42 API */
    async validateUser(code: string) {
        const token: { access_token: string, refresh_token: string } | undefined
            = await this.usersServices.getToken(code);
        if (typeof token === "undefined")
            return (undefined);
        const iduser: number = await this.usersServices.getInformationBearer(token);
        let user: any = await this.usersServices.findUserByIdForGuard(iduser);

        if (!user){
            user = await this.usersServices.createUser({ userID: iduser, username: '', token: '' });
        }
        return (user);
    }
    /* create fake user */
    async fakeUser() {
        const iduser: number = Math.ceil(Math.random() * 9452160 + 1000000);
        await this.usersServices.createUser({ userID: iduser, username:'', token: '' });
        let user: any = await this.usersServices.findUserByIdForGuard(iduser);
        console.log("FFAAKAKEDAKAL")
        console.log(user)
        return (user);
    }

    /* then log user, returning a Json web token */
    async login(user: TokenUser) {
        const payload = {
            sub: Number(user.userID),
            /*token: user.token,*/
            username: user.username,
            fa: user.fa,
            fa_code: user.fa_code
        }
        console.log("PAYYYYY")
        console.log(payload)
        const access_token = { access_token: this.jwtService.sign(payload) };
        console.log("aqdjqsjdhjkqshdjkqshdqskdhqsjkdhqsjkd")
        console.log(await this.usersServices.findUserByIdForGuard(user.userID));
        await this.usersServices.updateTokenJwt(Number(user.userID), access_token.access_token);
        return (access_token);
    }

    /* This is to check token when user first connect, no username or fa required*/
    async verifyFirstToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token, { secret: process.env.AUTH_SECRET });
            const userExistInDb = await this.usersServices.findUserByIdForGuard(decoded.sub);
            if (!userExistInDb)
                return (userExistInDb);
            //check token revoke
            if (userExistInDb.token != token)
                return (false);
            return (userExistInDb);
        } catch (e) {
            return (false);
        }
    }

    async verifyToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token, { secret: process.env.AUTH_SECRET });
            const userExistInDb = await this.usersServices.findUserByIdForGuard(decoded.sub)
            if (!userExistInDb)
                return (userExistInDb);
            //check token revoke
            if (userExistInDb.token != token)
                return (false);
            //check username and fa validity from database
            if (userExistInDb.username != decoded.username ||
                userExistInDb.username === "" || userExistInDb === null
                || (userExistInDb.fa === true
                    && (userExistInDb.secret_fa === null || userExistInDb.secret_fa === "")))
                return (false);
            //check if 2FA has been activated and if the fa_code is not empty
            if (userExistInDb.fa === true || userExistInDb.secret_fa) {
                if (!decoded.fa_code || decoded.fa_code === "")
                    return (false);
            }
            return (userExistInDb);
        } catch (e) {
            return (false);
        }
    }

    async refresh(user: TokenUser) {
        const payload = {
            sub: user.userID,
            /*token: user.token,*/
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