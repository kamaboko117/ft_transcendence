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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const create_chat_dto_1 = require("./dto/create-chat.dto");
const psw_chat_dto_1 = require("./psw-chat.dto");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt_guard_1 = require("../auth/jwt.guard");
const users_service_1 = require("../users/providers/users/users.service");
const chat_service_1 = require("./chat.service");
let ChatController = class ChatController {
    constructor(chatService, userService) {
        this.chatService = chatService;
        this.userService = userService;
    }
    getAllPublic() {
        return (this.chatService.getAllPublic());
    }
    async getAllPrivate(req) {
        const user = req.user;
        return (await this.chatService.getAllPrivate(user.userID));
    }
    async getAllUsersOnChannel(req, id) {
        const user = req.user;
        const listUsers = await this.chatService.getAllUsersOnChannel(id, user.userID);
        if (typeof listUsers === "undefined" || listUsers === null)
            return (false);
        return (listUsers);
    }
    async getDirectMessage(req) {
        const user = req.user;
        const channel = await this.chatService.getAllPmUser(user.userID);
        return (channel);
    }
    async getAllChanUser(req) {
        const user = req.user;
        const channel = await this.chatService.getAllUserOnChannels(user.userID);
        return (channel);
    }
    async findPm(user_id, id) {
        await this.chatService.findDuplicateAndDelete(String(user_id));
        await this.chatService.findDuplicateAndDelete(id);
        const list_user = await this.chatService.findPmUsers(user_id, id);
        if (typeof list_user === "undefined") {
            const ret = await this.chatService.createPrivateMessage(user_id, id);
            return (ret);
        }
        return (list_user.Channel_id);
    }
    async openPrivateMessageByUsername(req, username) {
        const tokenUser = req.user;
        const error = {
            valid: false,
            channel_id: "",
            listPm: {
                chatid: "", user: { username: "" }
            }
        };
        if (username === "" || typeof username === "undefined")
            return (error);
        const user = await this.userService.findUserByName(username);
        if (!user || tokenUser.userID === Number(user.userID))
            return (error);
        const channel_id = await this.findPm(tokenUser.userID, String(user.userID));
        console.log("CHANNEL FIND ID");
        console.log(channel_id);
        return ({
            valid: true,
            channel_id: channel_id,
            listPm: {
                chatid: channel_id, user: { username: user.username }
            }
        });
    }
    async openPrivateMessage(req, id) {
        const user = req.user;
        if (user.userID === Number(id))
            return ({ asw: null });
        const channel = await this.findPm(user.userID, id);
        return ({ asw: channel });
    }
    async getHasPaswd(req, id) {
        const user = req.user;
        const channel = await this.chatService.getChannelByTest(id);
        if (typeof channel != "undefined" && channel != null) {
            const getUser = await this.chatService.getUserOnChannel(id, user.userID);
            if (typeof getUser !== "undefined" || getUser === null)
                return (false);
        }
        if (typeof channel === "undefined" || (channel === null || channel === void 0 ? void 0 : channel.password) == '' || channel === null)
            return (false);
        return (true);
    }
    async postNewPublicChat(req, chat) {
        const user = req.user;
        const channel = await this.chatService.getChannelByName(chat.name);
        let err = [];
        const regex = /^[\wàâéêèäÉÊÈÇç]+(?: [\wàâéêèäÉÊÈÇç]+)*$/;
        const resultRegex = regex.exec(chat.name);
        if ((chat.accesstype != '0' && chat.accesstype != '1'))
            err.push("Illegal access type");
        if (chat.name.length === 0)
            err.push("Chat name must not be empty.");
        else if (chat.name == chat.password)
            err.push("Password and chat name can't be the same.");
        if (channel != null)
            err.push("Channel already exist.");
        if (chat.name.length > 0 && chat.name.length < 4)
            err.push("Channel name too short.");
        if (chat.name.length > 0 && 100 < chat.name.length)
            err.push("Channel name too long.");
        if (chat.name.length > 0 && !resultRegex)
            err.push("Channel name format is wrong.");
        if (err.length > 0)
            return (err);
        const getAll = await this.chatService.getAllPublic();
        const len = getAll.length.toString();
        const salt = Number(process.env.CHAT_SALT);
        if (chat.accesstype != '0' || typeof getAll == undefined)
            throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
        if (chat.password != '') {
            chat.accesstype = '1';
            chat.password = bcrypt.hashSync(chat.password, salt);
        }
        const findUser = await this.userService.findUsersById(user.userID);
        return (this.chatService.createChat(chat, len, { idUser: user.userID, username: findUser === null || findUser === void 0 ? void 0 : findUser.username }));
    }
    async postNewPrivateChat(req, chat) {
        const user = req.user;
        const channel = await this.chatService.getChannelByName(chat.name);
        let err = [];
        const regex = /^[\wàâéêèäÉÊÈÇç]+(?: [\wàâéêèäÉÊÈÇç]+)*$/;
        const resultRegex = regex.exec(chat.name);
        if ((chat.accesstype != '2' && chat.accesstype != '3'))
            err.push("Illegal access type");
        if (chat.name.length === 0)
            err.push("Chat name must not be empty.");
        else if (chat.name == chat.password)
            err.push("Password and chat name can't be the same.");
        if (chat.name.length > 0 && chat.name.length < 4)
            err.push("Channel name too short.");
        if (chat.name.length > 0 && 100 < chat.name.length)
            err.push("Channel name too long.");
        if (channel != null)
            err.push("Channel already exist.");
        if (chat.name.length > 0 && !resultRegex)
            err.push("Channel name format is wrong.");
        if (err.length > 0)
            return (err);
        const id = crypto.randomBytes(4).toString('hex');
        const salt = Number(process.env.CHAT_SALT);
        if (chat.password != '') {
            chat.accesstype = '3';
            chat.password = bcrypt.hashSync(chat.password, salt);
        }
        const findUser = await this.userService.findUsersById(user.userID);
        return (this.chatService.createChat(chat, id, { idUser: user.userID, username: findUser === null || findUser === void 0 ? void 0 : findUser.username }));
    }
    async passwordIsValid(psw) {
        const channel = await this.chatService.getChannelByTest(psw.id);
        if (typeof channel == "undefined" || channel === null || channel.password == '')
            return (false);
        const comp = await bcrypt.compare(psw.psw, channel.password);
        return (comp);
    }
    async getChannel(req, id) {
        const user = req.user;
        const chan = await this.chatService.getChannelByTest(id);
        const listMsg = await this.chatService.getListMsgByChannelId(id, user.userID);
        let channel = {
            id: chan === null || chan === void 0 ? void 0 : chan.id,
            name: chan === null || chan === void 0 ? void 0 : chan.name,
            owner: chan === null || chan === void 0 ? void 0 : chan.user_id,
            password: chan === null || chan === void 0 ? void 0 : chan.password,
            accesstype: chan === null || chan === void 0 ? void 0 : chan.accesstype,
            lstMsg: listMsg
        };
        if (typeof channel === "undefined" || channel === null)
            return ({});
        const getUser = await this.chatService.getUserOnChannel(id, user.userID);
        if (getUser === "Ban")
            return ({ ban: true });
        if (typeof getUser === "undefined" || getUser === null
            || getUser === "Ban")
            return ({});
        let arrayStart = channel.lstMsg.length - 30;
        let arrayEnd = channel.lstMsg.length;
        if (arrayStart < 0)
            arrayStart = 0;
        const convertChannel = {
            id: channel.id,
            name: channel.name,
            owner: channel.owner,
            accesstype: channel.accesstype,
            lstMsg: channel.lstMsg.slice(arrayStart, arrayEnd),
            authorized: true
        };
        return (convertChannel);
    }
};
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getAllPublic", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('private'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getAllPrivate", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getAllUsersOnChannel", null);
__decorate([
    (0, common_1.Get)('list-pm'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getDirectMessage", null);
__decorate([
    (0, common_1.Get)('channel-registered'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getAllChanUser", null);
__decorate([
    (0, common_1.Get)('find-pm-username'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "openPrivateMessageByUsername", null);
__decorate([
    (0, common_1.Get)('private-messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "openPrivateMessage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('has-paswd'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getHasPaswd", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('new-public'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_chat_dto_1.CreateChatDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "postNewPublicChat", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('new-private'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_chat_dto_1.CreateChatDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "postNewPrivateChat", null);
__decorate([
    (0, common_1.Post)('valid-paswd'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [psw_chat_dto_1.PswChat]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "passwordIsValid", null);
__decorate([
    (0, common_1.Get)(''),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChannel", null);
ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        users_service_1.UsersService])
], ChatController);
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map