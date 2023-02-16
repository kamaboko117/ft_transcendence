import { ExecutionContext, Injectable, SetMetadata, Inject, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
//import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';

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
        console.log("enter guard jwt");
        if (typeof request.route == "undefined")
        {
            console.log(request)
            console.log("token: " + request.handshake?.query?.token);
        }
        const tokenWs = request.handshake?.query?.token;
        //const reponse = context.switchToHttp().getResponse(); cookie part
        //const access_token = ExtractJwt.fromAuthHeaderAsBearerToken();
        //console.log(request);
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(), context.getClass()
        ]);
        if (isPublic)
            return (true);
	    //console.log(request.headers.authorization);
        if (typeof request.route != "undefined" && request.headers.authorization
            && typeof request.headers.authorization != undefined)
        {
            const bearer = request.headers.authorization.split('Bearer ')[1];
                if (this.authService.verifyToken(bearer) === false)
                        return (false);
        }
        else if (typeof request.route == "undefined"){
                console.log("ALLLOOOO");
                const bearer = request.handshake?.query?.token
                if (this.authService.verifyToken(bearer) === false)
                        return (false);
                return (true);
        }
        //console.log("zzzzzzzzzzzzzzzzzzzzzzz");
        //return (this.handleRequest(request, request.user));*/
        return (super.canActivate(context));
    }
}
