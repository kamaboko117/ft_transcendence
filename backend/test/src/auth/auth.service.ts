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
	/* create fake user */
	async fakeUser() {
		const iduser: number = Math.ceil(Math.random() * 9452160 + 1000000);
        const user = await this.usersServices.createUser({ userID: iduser, username: iduser.toString(), token: '' });
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
    verifyToken(token: string) {
        console.log("TOK: " + token);
        try {
            console.log("verify");
            const decoded = this.jwtService.verify(token, { secret: process.env.AUTH_SECRET });
            console.log("end verify");
            return (decoded);
        } catch (e) {
	//console.log(e);
            return (false);
        }
        return (false);
        //try {

        /*} catch (e) {
            console.log(e);
            console.log(request.cookies.refresh_token)
            //PARTIE IF typeof request.cookies.refresh_token === "undefined"

            //PARTIE NOT UNDEFINED ACCESS TOKEN EXPIRED
            if (typeof e.expiredAt != "undefined"
                && typeof request.cookies.refresh_token != "undefined") {
                //use refresh token to get new access
                console.log("error cookie");
                console.log("cookie defined");
                console.log(request.cookies.refresh_token);//y a des cookies adminer
                console.log("---");
                console.log("check refresh token");
                //try {
                    this.jwtService.verify(request.cookies.refresh_token, {
                        secret: process.env.AUTH_SECRET,
                    });
                }
                catch (e) {
                    const payload = {};
                    if (typeof e.expiredAt != "undefined") {
                        console.log("cookie token expired");
                        const access_token = this.jwtService.sign(payload)
                        //throw new UnauthorizedException("TEST THROW");
                        return (access_token);
                    }
                    throw new UnauthorizedException("Access not authorized.");
                }
                console.log("ppppppppppppp");
                return (true);
            }
            console.log("ERROR THROW: ");
            console.log(e);
            console.log("END THROW?");
            console.log("faut t'il re throw pour que canActivate catch?????????? wtf js");
        }*/
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
            refresh_token: this.jwtService.sign(payload, { expiresIn: '500s' })
        };
        return (refresh_token);
    }
}
