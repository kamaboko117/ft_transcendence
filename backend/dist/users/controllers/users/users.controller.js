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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_dtos_1 = require("../../dto/users.dtos");
const users_service_1 = require("../../providers/users/users.service");
const auth_guard_1 = require("../../../auth/auth.guard");
const fake_guard_1 = require("../../../auth/fake.guard");
const jwt_guard_1 = require("../../../auth/jwt.guard");
const jwt_first_guard_1 = require("../../../auth/jwt-first.guard");
const auth_service_1 = require("../../../auth/auth.service");
const platform_express_1 = require("@nestjs/platform-express");
const otplib_1 = require("otplib");
const qrcode_1 = require("qrcode");
const bcrypt = require("bcrypt");
let UsersController = class UsersController {
    constructor(userService, authService) {
        this.userService = userService;
        this.authService = authService;
    }
    async setFa(req) {
        const user = req.user;
        const userDb = await this.userService.getUserFaSecret(user.userID);
        if (!userDb || !(userDb === null || userDb === void 0 ? void 0 : userDb.username)) {
            throw new common_1.NotFoundException("Username not found");
        }
        if (userDb.fa === false
            || userDb.secret_fa === null || userDb.secret_fa === "")
            throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
        if (userDb.fa_first_entry === true)
            return ({ code: 3, url: null });
        const otpAuth = otplib_1.authenticator.keyuri(userDb.username, "ft_transcendence", userDb.secret_fa);
        const url = await (0, qrcode_1.toDataURL)(otpAuth);
        if (url)
            return ({ code: 2, url: url });
        return ({ code: 1, url: null });
    }
    async checkFa(req) {
        const user = req.user;
        const userDb = await this.userService.getUserFaSecret(user.userID);
        if (!(userDb === null || userDb === void 0 ? void 0 : userDb.username)) {
            throw new common_1.NotFoundException("Username not found");
        }
        if (userDb.fa === false
            || userDb.secret_fa === null || userDb.secret_fa === "")
            throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
        if (user.fa_code != "")
            throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
    }
    async validFaCode(req, body) {
        let user = req.user;
        const userDb = await this.userService.getUserFaSecret(user.userID);
        let isValid = false;
        let access_token = { access_token: "" };
        if (!(userDb === null || userDb === void 0 ? void 0 : userDb.username)) {
            throw new common_1.NotFoundException("Username not found");
        }
        try {
            if (!isNaN(body.code)) {
                if (userDb.fa_psw != null) {
                    const ret = await bcrypt.compare(String(body.code), userDb.fa_psw);
                    if (ret === true)
                        return ({ valid: false, username: userDb.username, token: null });
                }
                isValid = otplib_1.authenticator.verify({ token: String(body.code), secret: userDb.secret_fa });
                if (isValid) {
                    user.fa_code = String(body.code);
                    const salt = Number(process.env.SALT);
                    bcrypt.hash(user.fa_code, salt, ((err, psw) => {
                        if (!err && psw)
                            this.userService.update2FaPsw(user.userID, psw);
                        else
                            throw new common_1.NotFoundException("Authenticator code verification failed");
                    }));
                    this.userService.updateFaFirstEntry(user.userID);
                    access_token = await this.authService.login(user);
                    return ({ valid: isValid, username: userDb.username, token: access_token });
                }
                return ({ valid: false, username: userDb.username, token: null });
            }
        }
        catch (e) {
            throw new common_1.BadRequestException("Something went wrong");
        }
        return ({ valid: isValid, username: userDb.username, token: null });
    }
    async fakeLogin(req, response) {
        let user = req.user;
        user.fa_code = "";
        console.log("FAKE LOGIN");
        console.log(user);
        const access_token = await this.authService.login(user);
        const refresh = await this.authService.refresh(user);
        response.cookie('refresh_token', refresh.refresh_token, {
            maxAge: 300000,
            httpOnly: true,
            sameSite: 'Strict',
        });
        return ({
            token: access_token, user_id: req.user.userID,
            username: user.username, fa: user.fa
        });
    }
    checkUpdateUserError(ret_user, ret_user2, body) {
        let err = [];
        const regex2 = /^[\w\d]{3,}$/;
        const regexRet2 = regex2.test(body.username);
        if (24 < body.username.length)
            err.push("Username is too long");
        if (body.username.length === 0)
            err.push("Username can't be empty");
        if (body.username.length < 4 && body.username.length != 0)
            err.push("Username is too short");
        if (ret_user && ret_user2) {
            if (ret_user2.userID != ret_user.userID)
                if (ret_user.username === body.username)
                    err.push("Username is already used");
        }
        if (regexRet2 === false)
            err.push("Username format is wrong, please use alphabet and numerics values");
        return (err);
    }
    async updateUser(req, file, body) {
        let user = req.user;
        const ret_user = await this.userService.findUserByName(body.username);
        let ret_user2 = await this.userService.findUsersById(user.userID);
        let retErr = this.checkUpdateUserError(ret_user, ret_user2, body);
        if (retErr.length != 0)
            return ({ valid: false, err: retErr });
        if (file)
            await this.userService.updatePathAvatarUser(user.userID, file.path);
        if (body.username !== "")
            user.username = body.username;
        else if (ret_user2)
            user.username = ret_user2.username;
        if (body.username && body.username != "")
            this.userService.updateUsername(user.userID, body.username);
        const regex1 = /^({"fa":true})$/;
        const regexRet = body.fa.match(regex1);
        if (regexRet && (ret_user2 === null || ret_user2 === void 0 ? void 0 : ret_user2.fa) === false) {
            user.fa = true;
            user.fa_code = "";
            this.userService.update2FA(user.userID, true, otplib_1.authenticator.generateSecret());
        }
        else if (!regexRet) {
            user.fa = false;
            user.fa_code = "";
            this.userService.update2FA(user.userID, false, null);
        }
        const access_token = await this.authService.login(user);
        if (file)
            ret_user2 = await this.userService.findUsersById(user.userID);
        return ({
            valid: true, username: user.username,
            token: access_token, img: ret_user2 === null || ret_user2 === void 0 ? void 0 : ret_user2.avatarPath
        });
    }
    async uploadFirstLogin(req, file, body) {
        let user = req.user;
        const ret_user = await this.userService.getUserProfile(user.userID);
        const ret_user2 = await this.userService.findUserByName(body.username);
        let retErr = this.checkUpdateUserError(ret_user2, ret_user, body);
        if (retErr.length != 0)
            return ({ valid: false, err: retErr });
        const regex1 = /^({"fa":true})$/;
        const regexRet = body.fa.match(regex1);
        if (file)
            this.userService.updatePathAvatarUser(user.userID, file.path);
        this.userService.updateUsername(user.userID, body.username);
        if (regexRet) {
            this.userService.update2FA(user.userID, true, otplib_1.authenticator.generateSecret());
            user.fa = true;
            user.fa_code = "";
        }
        user.username = body.username;
        const access_token = await this.authService.login(user);
        return ({ valid: true, username: body.username, token: access_token });
    }
    uploadFile(req, file) {
        const user = req.user;
        this.userService.updatePathAvatarUser(user.userID, file.path);
        return ({ path: file.path });
    }
    async getProfile(req) {
        const user = req.user;
        const ret_user = await this.userService.getUserProfile(user.userID);
        return (ret_user);
    }
    async firstConnectionProfile(req) {
        const user = req.user;
        const ret_user = await this.userService.getUserProfile(user.userID);
        return (ret_user);
    }
    async getUserInfo(req, name) {
        const user = req.user;
        const ret_user = await this.userService.findUserByName(name);
        if (!ret_user)
            return ({ valid: false });
        let info = await this.userService.focusUserBlFr(user.userID, Number(ret_user === null || ret_user === void 0 ? void 0 : ret_user.userID));
        if (!info) {
            return ({
                valid: true, id: ret_user.userID,
                User_username: ret_user.username, fl: null,
                bl: null
            });
        }
        info.valid = true;
        return (info);
    }
    async getFriendBlackListUser(req) {
        const user = req.user;
        const getBlFr = await this.userService.getBlackFriendListBy(user.userID);
        return (getBlFr);
    }
    async getUsername(req) {
        const user = req.user;
        const ret_user = await this.userService.findUserByName(user.username);
        return (ret_user);
    }
    async getNbVictory(req) {
        const user = req.user;
        const ret_nb = await this.userService.getVictoryNb(user.userID);
        return (ret_nb);
    }
    async getNbGames(req) {
        const user = req.user;
        const ret_nb = await this.userService.getGamesNb(user.userID);
        return (ret_nb);
    }
    async getMHRaw(req) {
        const user = req.user;
        const ret_raw = await this.userService.getRawMH(user.userID);
        return (ret_raw);
    }
    async addFriend(req, body) {
        const user = req.user;
        const ret_user = await this.userService.findUserByName(body.username);
        if (!ret_user)
            return ({ code: 0 });
        else if (Number(ret_user.userID) == user.userID)
            return ({ code: 2 });
        const findInList = await this.userService.searchUserInList(user.userID, ret_user.userID, 2);
        console.log(findInList);
        if (findInList)
            return ({ code: 1 });
        this.userService.insertBlFr(user.userID, Number(ret_user.userID), 2);
        const findInBlackList = await this.userService.searchUserInList(user.userID, ret_user.userID, 1);
        if (findInBlackList) {
            return ({
                code: 3, id: Number(ret_user.userID),
                fl: 2, bl: 1,
                User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
            });
        }
        return ({
            code: 3, id: Number(ret_user.userID),
            fl: 2, bl: 0,
            User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
        });
    }
    async addBlackList(req, body) {
        const user = req.user;
        const ret_user = await this.userService.findUserByName(body.username);
        if (!ret_user)
            return ({ code: 0 });
        else if (Number(ret_user.userID) == user.userID)
            return ({ code: 2 });
        const findInList = await this.userService.searchUserInList(user.userID, ret_user.userID, 1);
        console.log(findInList);
        if (findInList)
            return ({ code: 1 });
        this.userService.insertBlFr(user.userID, Number(ret_user.userID), 1);
        const findInBlackList = await this.userService.searchUserInList(user.userID, ret_user.userID, 2);
        if (findInBlackList) {
            return ({
                code: 3, id: Number(ret_user.userID),
                fl: 2, bl: 1,
                User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
            });
        }
        return ({
            code: 3, id: Number(ret_user.userID),
            fl: 2, bl: 0,
            User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
        });
    }
    async useBlackFriendList(req, body) {
        const user = req.user;
        const find = await this.userService.findBlFr(user.userID, body.userId, body.type);
        if (user.userID === body.userId)
            return ({ add: false, type: null });
        if (find) {
            this.userService.deleteBlFr(user.userID, body.userId, body.type, find.id);
            return ({ add: false, type: body.type });
        }
        else {
            console.log("insert");
            this.userService.insertBlFr(user.userID, body.userId, body.type);
        }
        return ({ add: true, type: body.type });
    }
    async login(req, response) {
        let user = req.user;
        user.fa_code = "";
        console.log("LOGIN");
        console.log(user);
        const access_token = await this.authService.login(user);
        const refresh = await this.authService.refresh(user);
        response.cookie('refresh_token', refresh.refresh_token, {
            maxAge: 300000,
            httpOnly: true,
            sameSite: 'Strict',
        });
        return ({
            token: access_token, user_id: req.user.userID,
            username: user.username, fa: user.fa
        });
    }
    createUsers(createUserDto) {
        return this.userService.createUser(createUserDto);
    }
    async findUsersById(id) {
        const user = await this.userService.findUsersById(id);
        if (!user)
            return ({ userID: 0, username: "", avatarPath: null, sstat: {} });
        return (user);
    }
};
__decorate([
    (0, jwt_guard_1.Public)(),
    (0, common_1.UseGuards)(jwt_first_guard_1.JwtFirstGuard),
    (0, common_1.Get)('set-fa'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setFa", null);
__decorate([
    (0, jwt_guard_1.Public)(),
    (0, common_1.UseGuards)(jwt_first_guard_1.JwtFirstGuard),
    (0, common_1.Get)('check-fa'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "checkFa", null);
__decorate([
    (0, jwt_guard_1.Public)(),
    (0, common_1.UseGuards)(jwt_first_guard_1.JwtFirstGuard),
    (0, common_1.Post)('valid-fa-code'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dtos_1.Code]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "validFaCode", null);
__decorate([
    (0, jwt_guard_1.Public)(),
    (0, common_1.UseGuards)(fake_guard_1.FakeAuthGuard),
    (0, common_1.Get)('fake-login'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "fakeLogin", null);
__decorate([
    (0, common_1.Post)('update-user'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('fileset', { dest: './upload_avatar' })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 1000000 }),
            new common_1.FileTypeValidator({ fileType: /^image\/(png|jpg|jpeg)$/ }),
        ], fileIsRequired: false
    }))),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, users_dtos_1.UpdateUser]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, jwt_guard_1.Public)(),
    (0, common_1.UseGuards)(jwt_first_guard_1.JwtFirstGuard),
    (0, common_1.Post)('firstlogin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('fileset', { dest: './upload_avatar' })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 1000000 }),
            new common_1.FileTypeValidator({ fileType: /^image\/(png|jpg|jpeg)$/ }),
        ], fileIsRequired: false
    }))),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, users_dtos_1.FirstConnection]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadFirstLogin", null);
__decorate([
    (0, common_1.Post)('avatarfile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('fileset', { dest: './upload_avatar' })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 1000000 }),
            new common_1.FileTypeValidator({ fileType: 'image/png' }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, jwt_guard_1.Public)(),
    (0, common_1.UseGuards)(jwt_first_guard_1.JwtFirstGuard),
    (0, common_1.Get)('first-profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "firstConnectionProfile", null);
__decorate([
    (0, common_1.Get)('info-fr-bl'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserInfo", null);
__decorate([
    (0, common_1.Get)('fr-bl-list'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFriendBlackListUser", null);
__decorate([
    (0, common_1.Get)('get-username'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsername", null);
__decorate([
    (0, common_1.Get)('get-victory-nb'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getNbVictory", null);
__decorate([
    (0, common_1.Get)('get-games-nb'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getNbGames", null);
__decorate([
    (0, common_1.Get)('get_raw_mh'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMHRaw", null);
__decorate([
    (0, common_1.Post)('add-friend'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dtos_1.Username]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addFriend", null);
__decorate([
    (0, common_1.Post)('add-blacklist'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dtos_1.Username]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addBlackList", null);
__decorate([
    (0, common_1.Post)('fr-bl-list'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dtos_1.BlockUnblock]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "useBlackFriendList", null);
__decorate([
    (0, jwt_guard_1.Public)(),
    (0, common_1.UseGuards)(auth_guard_1.CustomAuthGuard),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_dtos_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findUsersById", null);
UsersController = __decorate([
    (0, common_1.Controller)("users"),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        auth_service_1.AuthService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map