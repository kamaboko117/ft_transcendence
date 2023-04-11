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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/providers/users/users.service");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(usersServices, jwtService) {
        this.usersServices = usersServices;
        this.jwtService = jwtService;
    }
    async validateUser(code) {
        const token = await this.usersServices.getToken(code);
        if (typeof token === "undefined")
            return (undefined);
        const iduser = await this.usersServices.getInformationBearer(token);
        let user = await this.usersServices.findUserByIdForGuard(iduser);
        if (!user)
            user = await this.usersServices.createUser({ userID: iduser, username: '', token: '' });
        return (user);
    }
    async fakeUser() {
        const iduser = Math.ceil(Math.random() * 9452160 + 1000000);
        const user = await this.usersServices.createUser({ userID: iduser, username: iduser.toString(), token: '' });
        return (user);
    }
    async login(user) {
        const payload = {
            sub: user.userID,
            token: user.token,
            username: user.username,
            fa: user.fa,
            fa_code: user.fa_code
        };
        const access_token = { access_token: this.jwtService.sign(payload) };
        return (access_token);
    }
    async verifyFirstToken(token) {
        console.log("TOK: " + token);
        try {
            const decoded = this.jwtService.verify(token, { secret: process.env.AUTH_SECRET });
            const userExistInDb = await this.usersServices.findUserByIdForGuard(decoded.sub);
            if (!userExistInDb)
                return (userExistInDb);
            return (userExistInDb);
        }
        catch (e) {
            return (false);
        }
    }
    async verifyToken(token) {
        console.log("TOK: " + token);
        try {
            const decoded = this.jwtService.verify(token, { secret: process.env.AUTH_SECRET });
            const userExistInDb = await this.usersServices.findUserByIdForGuard(decoded.sub);
            if (!userExistInDb)
                return (userExistInDb);
            if (userExistInDb.username != decoded.username ||
                userExistInDb.username === "" || userExistInDb === null
                || (userExistInDb.fa === true
                    && (userExistInDb.secret_fa === null || userExistInDb.secret_fa === "")))
                return (false);
            if (userExistInDb.fa === true || userExistInDb.secret_fa) {
                if (!decoded.fa_code || decoded.fa_code === "")
                    return (false);
            }
            return (userExistInDb);
        }
        catch (e) {
            return (false);
        }
    }
    async refresh(user) {
        const payload = {
            sub: user.userID,
            token: user.token,
            username: user.username,
            fa: user.fa
        };
        console.log("refresh payload");
        console.log(payload);
        const refresh_token = {
            refresh_token: this.jwtService.sign(payload, { expiresIn: '500s' })
        };
        return (refresh_token);
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map