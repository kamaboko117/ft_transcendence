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
exports.UsersGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const class_validator_1 = require("class-validator");
const socket_io_1 = require("socket.io");
const auth_service_1 = require("../../../auth/auth.service");
const jwt_guard_1 = require("../../../auth/jwt.guard");
class Info {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], Info.prototype, "userId", void 0);
let UsersGateway = class UsersGateway {
    constructor(authService) {
        this.authService = authService;
        this.mapSocket = new Map();
    }
    getStatusUser(data) {
        const map = this.mapSocket;
        for (let value of map.values()) {
            if (value === String(data.userId)) {
                console.log("equal");
                return ({ code: 1 });
            }
        }
        return ({ code: 0 });
    }
    async handleConnection(client) {
        const bearer = client.handshake.headers.authorization;
        if (bearer) {
            const user = await this.authService.verifyToken(bearer);
            if (!user)
                return;
            this.mapSocket.forEach((value, key) => {
                this.server.to(key).emit("currentStatus", {
                    code: 1, userId: user.userID
                });
            });
            if (user)
                this.mapSocket.set(client.id, user.userID);
        }
    }
    async handleDisconnect(client) {
        let found = undefined;
        for (let [key, value] of this.mapSocket.entries()) {
            if (key === client.id) {
                found = value;
            }
        }
        if (found) {
            this.mapSocket.forEach((value, key) => {
                this.server.to(key).emit("currentStatus", {
                    code: 0, userId: found
                });
            });
            this.mapSocket.delete(client.id);
        }
    }
    getMap() {
        return (this.mapSocket);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], UsersGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, websockets_1.SubscribeMessage)('status'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Info]),
    __metadata("design:returntype", void 0)
], UsersGateway.prototype, "getStatusUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], UsersGateway.prototype, "handleConnection", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], UsersGateway.prototype, "handleDisconnect", null);
UsersGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "http://127.0.0.1:4000", credential: true
        }
    }),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], UsersGateway);
exports.UsersGateway = UsersGateway;
//# sourceMappingURL=users.gateway.js.map