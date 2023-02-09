import { Injectable } from '@nestjs/common';
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
        const token: string | undefined = await this.usersServices.getToken(code);
        if (typeof token === "undefined")
            return (undefined);
        const iduser: number = await this.usersServices.getInformationBearer(token);
        console.log("iduser: " + iduser);
        let user: any = await this.usersServices.findUsersById(iduser);
        if (!user)
            user = await this.usersServices.createUser({ userID: iduser, username: '', token: token });
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
}
