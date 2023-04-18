import { Strategy } from 'passport-jwt';
import { TokenUser } from 'src/chat/chat.interface';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: {
        sub: string;
        token: string;
        username: string;
        fa: boolean;
        fa_code: string;
    }): Promise<TokenUser>;
}
export {};
