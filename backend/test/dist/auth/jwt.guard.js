"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtGuard = exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const core_1 = require("@nestjs/core");
const websockets_1 = require("@nestjs/websockets");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
let JwtGuard = class JwtGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(authService, reflector) {
        super({ passReqToCallback: true });
        this.authService = authService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const isPublic = this.reflector.getAllAndOverride(exports.IS_PUBLIC_KEY, [
            context.getHandler(), context.getClass()
        ]);
        let bearer = "";
        if (isPublic)
            return (true);
        console.log("guard jwt");
        if (typeof request.route != "undefined"
            && typeof request.headers.authorization != "undefined") {
            bearer = request.headers.authorization.split('Bearer ')[1];
            console.log("jwt route");
            console.log(request.route.path);
        }
        else if (typeof request.route == "undefined") {
            bearer = request.handshake.headers.authorization;
        }
        if (typeof bearer == "undefined")
            return (false);
        const decoded = await this.authService.verifyToken(bearer);
        if ((decoded === null && typeof request.route == "undefined")
            || (decoded === false && typeof request.route == "undefined")) {
            console.log("exception");
            throw new websockets_1.WsException('Token not valid');
        }
        else if (decoded === null || decoded === false)
            return (false);
        if (typeof request.route == "undefined") {
            request.headers = {};
            request.headers.authorization = "Bearer " + bearer;
        }
        super.canActivate(context);
        return (true);
    }
};
JwtGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(auth_service_1.AuthService)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        core_1.Reflector])
], JwtGuard);
exports.JwtGuard = JwtGuard;
//# sourceMappingURL=jwt.guard.js.map