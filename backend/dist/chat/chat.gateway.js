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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const class_validator_1 = require("class-validator");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_entity_1 = require("./chat.entity");
const lstmsg_entity_1 = require("./lstmsg.entity");
const lstuser_entity_1 = require("./lstuser.entity");
const jwt_guard_1 = require("../auth/jwt.guard");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const chat_service_1 = require("./chat.service");
class Room {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Room.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Room.prototype, "psw", void 0);
class SendMsg {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMsg.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMsg.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMsg.prototype, "content", void 0);
let ChatGateway = class ChatGateway {
    constructor(dataSource, authService, chatService) {
        this.dataSource = dataSource;
        this.authService = authService;
        this.chatService = chatService;
        this.mapSocket = new Map();
    }
    getMap() {
        return (this.mapSocket);
    }
    async joinRoomChat(socket, data) {
        const user = socket.user;
        if (typeof user.userID != "number")
            return (false);
        const channel = await this.chatsRepository.findOne({
            where: {
                id: data.id
            }
        });
        if (typeof channel != "undefined" && channel != null) {
            const getUser = await this.chatService.getUserOnChannel(data.id, user.userID);
            if (channel.accesstype === '4' && !getUser)
                return (false);
            if (getUser === "Ban")
                return ({ ban: true });
            if (typeof getUser === "undefined" || getUser === null) {
                const newUser = await this.chatService.setNewUserChannel(channel, user.userID, data);
                if (typeof newUser === "undefined") {
                    return (false);
                }
                this.server.to(data.id).emit("updateListChat", true);
            }
        }
        socket.join(data.id);
        return (true);
    }
    async searchAndSetAdministratorsChannel(id) {
        let listUser = await this.listUserRepository.createQueryBuilder("list_user")
            .select(["list_user.id", "list_user.user_id"])
            .where("list_user.chatid = :id")
            .setParameters({ id: id })
            .andWhere("list_user.role = :role")
            .setParameters({ role: 'Administrator' })
            .getMany();
        if (listUser.length === 0) {
            listUser = await this.listUserRepository.createQueryBuilder("list_user")
                .select(["list_user.id", "list_user.user_id"])
                .where("list_user.chatid = :id")
                .setParameters({ id: id })
                .getMany();
        }
        if (listUser.length > 0) {
            await this.chatsRepository.createQueryBuilder().update(chat_entity_1.Channel)
                .set({ user_id: listUser[0].user_id })
                .where("id = :id")
                .setParameters({ id: id })
                .execute();
            await this.listUserRepository.createQueryBuilder().update(lstuser_entity_1.ListUser)
                .set({ role: "Owner" })
                .where("id = :id")
                .setParameters({ id: listUser[0].id })
                .execute();
        }
    }
    async setNewOwner(userId, id, ownerId) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            await this.chatsRepository
                .createQueryBuilder()
                .delete()
                .from(lstuser_entity_1.ListUser)
                .where("user_id = :id")
                .setParameters({ id: userId })
                .execute();
            if (Number(ownerId) === userId) {
                await this.searchAndSetAdministratorsChannel(id);
            }
            const channel = await this.chatsRepository.findOne({
                where: {
                    id: id
                }
            });
            await runner.commitTransaction();
            return (channel);
        }
        catch (e) {
            await runner.rollbackTransaction();
        }
        finally {
            await runner.release();
        }
    }
    async leaveRoomChat(socket, data) {
        const user = socket.user;
        if (typeof user.userID != "number")
            return ("Couldn't' leave chat, wrong type id?");
        const getUser = await this.chatService.getUserOnChannel(data.id, user.userID);
        if (getUser === "Ban")
            return ({ ban: true });
        if (typeof getUser === "undefined" || getUser === null)
            return ("No user found");
        const channel = await this.setNewOwner(user.userID, data.id, getUser.user_id);
        const [listUsr, count] = await this.listUserRepository.findAndCountBy({ chatid: data.id });
        socket.leave(data.id);
        this.server.to(data.id).emit("updateListChat", true);
        if (channel != undefined && channel != null && count === 0)
            this.chatsRepository.delete(data);
        return (getUser.User_username + " left the chat");
    }
    async stopEmit(socket, data) {
        const user = socket.user;
        if (typeof data === "undefined"
            || !user || typeof user.userID != "number")
            return;
        const getChannel = await this.chatService.getUserOnChannel(data.id, user.userID);
        if (getChannel === "Ban") {
            socket.leave(data.id);
            return ({ ban: true });
        }
        if (typeof getChannel !== "undefined" && getChannel !== null) {
            socket.leave(data.id);
        }
    }
    async newPostChat(socket, data) {
        const user = socket.user;
        if (typeof user.userID != "number")
            return;
        const getUser = await this.chatService.getUserOnChannel(data.id, user.userID);
        if (getUser === "Ban")
            return ({
                room: data.id,
                user_id: user.userID,
                user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
                content: "You are banned from this channel"
            });
        if (typeof getUser === "undefined" || getUser === null)
            return (undefined);
        const isMuted = await this.chatService.getUserMuted(data.id, user.userID);
        if (isMuted)
            return ({
                room: data.id,
                user_id: user.userID,
                user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
                content: "You are muted from this channel"
            });
        this.listMsgRepository
            .createQueryBuilder()
            .insert()
            .into(lstmsg_entity_1.ListMsg)
            .values([{
                user_id: user.userID,
                content: data.content,
                chatid: data.id
            }])
            .execute();
        socket.to(data.id).emit("sendBackMsg", {
            room: data.id,
            user_id: user.userID,
            user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
            content: data.content
        });
        socket.to(data.id).emit("sendBackMsg2", {
            room: data.id,
            user_id: user.userID,
            user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
            content: data.content
        });
        return ({
            room: data.id,
            user_id: user.userID,
            user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
            content: data.content
        });
    }
    async handleConnection(client) {
        const bearer = client.handshake.headers.authorization;
        if (bearer) {
            const user = await this.authService.verifyToken(bearer);
            if (user)
                this.mapSocket.set(client.id, user.userID);
        }
    }
    async handleDisconnect(client) {
        const bearer = client.handshake.headers.authorization;
        if (bearer) {
            const user = await this.authService.verifyToken(bearer);
            if (user)
                this.mapSocket.delete(client.id);
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, typeorm_1.InjectRepository)(chat_entity_1.Channel),
    __metadata("design:type", typeorm_2.Repository)
], ChatGateway.prototype, "chatsRepository", void 0);
__decorate([
    (0, typeorm_1.InjectRepository)(lstuser_entity_1.ListUser),
    __metadata("design:type", typeorm_2.Repository)
], ChatGateway.prototype, "listUserRepository", void 0);
__decorate([
    (0, typeorm_1.InjectRepository)(lstmsg_entity_1.ListMsg),
    __metadata("design:type", typeorm_2.Repository)
], ChatGateway.prototype, "listMsgRepository", void 0);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, websockets_1.SubscribeMessage)('joinRoomChat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Room]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "joinRoomChat", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, websockets_1.SubscribeMessage)('leaveRoomChat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Room]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "leaveRoomChat", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, websockets_1.SubscribeMessage)('stopEmit'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "stopEmit", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, websockets_1.SubscribeMessage)('sendMsg'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, SendMsg]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "newPostChat", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleConnection", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDisconnect", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "http://127.0.0.1:4000", credential: true
        }
    }),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        auth_service_1.AuthService, chat_service_1.ChatService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map