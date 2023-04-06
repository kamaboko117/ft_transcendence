import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "custom") {
    constructor(private authService: AuthService) {
        super();
    }

    async validate(req: any): Promise<any> {
        const code: string = req.body.code;

        if (typeof code === "undefined" || !code || code === '')
            return (false);
        const user = await this.authService.validateUser(code);
        console.log(user)
        if (!user || typeof user == "undefined")
            throw new UnauthorizedException();
        //must return User
        return (user);
    }
}