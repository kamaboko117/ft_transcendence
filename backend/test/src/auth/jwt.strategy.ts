import { Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
//https://www.passportjs.org/packages/passport-jwt/

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            secretOrKey: process.env.AUTH_SECRET,
        });
    }

    async validate(payload: any) {
        console.log("payload jwt");
        console.log(payload);
        const ret: {userID: number, token: string, username: string} = {
            userID: Number(payload.sub),
            token: payload.token,
            username: payload.username
        };
        console.log(ret);
        return (ret);
    }
}