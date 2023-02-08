import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/services/users/users.service';

@Injectable()
export class AuthService {
    constructor(private usersServices: UsersService) {}
    async validateUser(code: string) {
        const token: string | undefined = await this.usersServices.getToken(code);
        if (typeof token === "undefined")
            return (undefined);
        const iduser: number = await this.usersServices.getInformationBearer(token);
        console.log("iduser: " + iduser);
        let user: any = await this.usersServices.findUsersById(iduser);
        console.log(user);
        if (!user)
            user = await this.usersServices.createUser({userID: iduser, username: '', token: token});
        return (user);
    }
}
