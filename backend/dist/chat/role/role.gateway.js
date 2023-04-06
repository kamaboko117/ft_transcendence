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
exports.RoleGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_gateway_1 = require("../chat.gateway");
let RoleGateway = class RoleGateway {
    afterInit(server) { }
    constructor(chatGateway) {
        this.chatGateway = chatGateway;
    }
    emitToRoom(id, user_id, username, avatar_path, emit_name) {
        let content = "";
        if (emit_name === "Ban")
            content = username + " is banned from this channel";
        else if (emit_name === "Kick")
            content = username + " is kicked from this channel";
        else
            content = username + " is muted from this channel";
        this.server.to(id).emit("actionOnUser", {
            room: id,
            user_id: String(user_id),
            user: { username: username, avatarPath: avatar_path },
            content: content,
            type: emit_name
        });
        this.server.to(id).emit("actionOnUser" + "2", {
            room: id,
            user_id: String(user_id),
            user: { username: username, avatarPath: avatar_path },
            content: content,
            type: emit_name
        });
    }
    actionOnUser(id, user_id, username, avatar_path, emit_name) {
        this.emitToRoom(id, user_id, username, avatar_path, emit_name);
        const map = this.chatGateway.getMap();
        if (emit_name === "Ban" || emit_name === "Kick") {
            map.forEach((value, key) => {
                if (value === String(user_id)) {
                    this.server.in(key).socketsLeave(id);
                }
            });
        }
    }
    updateListChat(id) {
        this.server.to(id).emit("updateListChat", true);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RoleGateway.prototype, "server", void 0);
RoleGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "http://127.0.0.1:4000", credential: true
        }
    }),
    __metadata("design:paramtypes", [chat_gateway_1.ChatGateway])
], RoleGateway);
exports.RoleGateway = RoleGateway;
//# sourceMappingURL=role.gateway.js.map