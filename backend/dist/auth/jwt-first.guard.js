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
exports.JwtFirstGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
let JwtFirstGuard = class JwtFirstGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(authService) {
        super({ passReqToCallback: true });
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        let bearer = "";
        if (typeof request.route != "undefined"
            && typeof request.headers.authorization != "undefined") {
            bearer = request.headers.authorization.split('Bearer ')[1];
        }
        if (typeof bearer == "undefined")
            return (false);
        const decoded = await this.authService.verifyFirstToken(bearer);
        if (decoded === null || decoded === false)
            return (false);
        super.canActivate(context);
        return (true);
    }
};
JwtFirstGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(auth_service_1.AuthService)),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], JwtFirstGuard);
exports.JwtFirstGuard = JwtFirstGuard;
//# sourceMappingURL=jwt-first.guard.js.map