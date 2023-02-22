import { ExecutionContext, Injectable, SetMetadata, Inject, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
//import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    constructor(@Inject(AuthService) private authService: AuthService,
        private reflector: Reflector) {
        super({ passReqToCallback: true });
    }
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest(); //see guard doc
        const websocket = context.switchToWs().getClient();
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(), context.getClass()
        ]);
        let bearer: string = "";
        console.log("enter guard jwt");
        if (isPublic)
            return (true);
        if (typeof request.route != "undefined"
            && typeof request.headers.authorization != "undefined")
            bearer = request.headers.authorization.split('Bearer ')[1];
        else if (typeof request.route == "undefined") {
            bearer = request.handshake.headers.authorization;
        }
        if (typeof bearer == "undefined")
            return (false);
        const decoded = this.authService.verifyToken(bearer);
        if (decoded === false && typeof request.route == "undefined") {
            console.log("decoded false");
            throw new WsException('Token not valid');;
        }
        else if (decoded === false)
            return (false);
        if (typeof request.route == "undefined") {
            console.log("bearer: " + bearer);
            request.headers = {};
            request.headers.authorization = "Bearer " + bearer;
            //return (Boolean(decoded));
        }
        //console.log("zzzzzzzzzzzzzzzzzzzzzzz");
        //return (this.handleRequest(request, request.user));*/
        return (super.canActivate(context));
    }
}
