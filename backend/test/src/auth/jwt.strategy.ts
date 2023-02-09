import { Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
//https://www.passportjs.org/packages/passport-jwt/

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.AUTH_SECRET,
        });
    }

    async validate(payload: any) {
        const ret = {
            userID: payload.sub,
            token: payload.token,
            username: payload.username
        };
        console.log(ret);
        return (ret);
    }
}