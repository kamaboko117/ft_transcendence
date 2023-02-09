import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/services/users/users.service';
import { JwtService } from '@nestjs/jwt';

type User = {
    userID: string,
    token: string,
    username: string
}

@Injectable()
export class AuthService {
    constructor(private usersServices: UsersService,
        private jwtService: JwtService) { }
    async validateUser(code: string) {
        const token: string | undefined = await this.usersServices.getToken(code);
        if (typeof token === "undefined")
            return (undefined);
        const iduser: number = await this.usersServices.getInformationBearer(token);
        console.log("iduser: " + iduser);
        let user: any = await this.usersServices.findUsersById(iduser);
        console.log(user);
        if (!user)
            user = await this.usersServices.createUser({ userID: iduser, username: '', token: token });
        return (user);
    }

    async login(user: User) {
        const payload = {
            sub: user.userID,
            token: user.token,
            username: user.username
        }
        const access_token: string = this.jwtService.sign(payload);
        return (access_token);
    }
}
