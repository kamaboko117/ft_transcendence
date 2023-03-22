import { Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { TokenUser } from 'src/chat/chat.interface';
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

    async validate(payload: {sub: string, token: string,
        username: string, fa: boolean}) {
        console.log("payload jwt");
        console.log(payload);
        const ret: TokenUser = {
            userID: Number(payload.sub),
            token: payload.token,
            username: payload.username,
            fa: payload.fa
        };
        console.log(ret);
        return (ret);
    }
}