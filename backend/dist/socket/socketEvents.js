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
exports.SocketEvents = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const websockets_2 = require("@nestjs/websockets");
const users_gateway_1 = require("../users/providers/users/users.gateway");
const rooms_service_1 = require("../rooms/services/rooms/rooms.service");
const FPS = 60;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const player1 = {
    x: 0,
    y: CANVAS_HEIGHT / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "WHITE",
    score: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
};
const player2 = {
    x: CANVAS_WIDTH - 10,
    y: CANVAS_HEIGHT / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "WHITE",
    score: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
};
const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: 10,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: "WHITE",
};
function collision(player, ball) {
    player.top = player.y;
    player.bottom = player.y + player.height;
    player.left = player.x;
    player.right = player.x + player.width;
    ball.top = ball.y - ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;
    ball.right = ball.x + ball.radius;
    return (ball.left < player.right &&
        ball.top < player.bottom &&
        ball.right > player.left &&
        ball.bottom > player.top);
}
function resetBall() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    ball.speed = 5;
    let newVelocityX = -ball.velocityX;
    let newVelocityY = -ball.velocityY;
    ball.velocityX = 0;
    ball.velocityY = 0;
    setTimeout(() => {
        ball.velocityX = newVelocityX;
        ball.velocityY = newVelocityY;
    }, 1500);
    console.log("velocityX: ", ball.velocityX);
}
function update() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    if (ball.y + ball.radius > CANVAS_HEIGHT || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }
    let player = ball.x < CANVAS_WIDTH / 2 ? player1 : player2;
    if (collision(player, ball)) {
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = ball.x + ball.radius < CANVAS_WIDTH / 2 ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.1;
    }
    if (ball.x - ball.radius < 0) {
        player2.score++;
        resetBall();
    }
    else if (ball.x + ball.radius > CANVAS_WIDTH) {
        player1.score++;
        resetBall();
    }
}
let SocketEvents = class SocketEvents {
    constructor(userGateway, roomsService) {
        this.userGateway = userGateway;
        this.roomsService = roomsService;
    }
    handleConnection(client) {
        console.log("Client connected: ", client.id);
    }
    handleDisconnect(client) {
        console.log("Client disconnected: ", client.id);
    }
    isUserConnected(id) {
        const map = this.userGateway.getMap();
        for (let [key, value] of map.entries()) {
            if (value === id) {
                return (true);
            }
        }
        return (false);
    }
    inviteUserToGame(userId, userIdFocus, idGame) {
        const map = this.userGateway.getMap();
        for (let [key, value] of map.entries()) {
            if (value === userIdFocus) {
                this.server.to(key).emit('inviteGame', { idGame: idGame, user_id: userId });
            }
        }
    }
    MatchmakeUserToGame(userId, userIdFocus, idGame) {
        const map = this.userGateway.getMap();
        for (let [key, value] of map.entries()) {
            if (value === userIdFocus) {
                this.server.to(key).emit('matchmakeGame', { idGame: idGame, user_id: userId });
            }
            if (value === userId) {
                this.server.to(key).emit('matchmakeGame', { idGame: idGame, user_id: userId });
            }
        }
    }
    getSocketGameRoom(socket) {
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);
        return socketRooms[0];
    }
    leave(data, client) {
        console.log("client id: " + client.id + "is leaving room");
        if (data)
            client.leave(data.roomId);
    }
    checkIfUserFound(room, clientId) {
        const map = this.userGateway.getMap();
        console.log(room);
        const split = room === null || room === void 0 ? void 0 : room.roomName.split('|');
        console.log(split);
        if (split) {
            for (let [key, value] of map.entries()) {
                if (key === clientId) {
                    if (value === split[0] || value === split[1])
                        return (true);
                }
            }
        }
        return (false);
    }
    async join(data, client) {
        console.log("New user joining room: ", data);
        console.log(this.server.sockets.adapter.rooms);
        const connectedSockets = this.server.sockets.adapter.rooms.get(data.roomId);
        const socketRooms = Array.from(client.rooms.values()).filter((r) => r !== client.id);
        const room = await this.roomsService.findRoomById(data.roomId);
        console.log(connectedSockets === null || connectedSockets === void 0 ? void 0 : connectedSockets.size);
        if ((connectedSockets && (connectedSockets === null || connectedSockets === void 0 ? void 0 : connectedSockets.size) > 1)) {
            client.emit("join_game_error", { error: "Room is full" });
            return;
        }
        else {
            await client.join(data.roomId);
            if (room && room.private === true) {
                const result = this.checkIfUserFound(room, client.id);
                console.log("result: " + result);
                console.log(this.server.sockets.adapter.rooms.get(data.roomId));
                if (result === false) {
                    client.emit("join_game_error", { error: "You are spectactor" });
                    return;
                }
            }
            client.emit("join_game_success", { roomId: data.roomId });
            if ((connectedSockets === null || connectedSockets === void 0 ? void 0 : connectedSockets.size) === 2) {
                console.log("Starting game");
                client.emit("start_game", { side: 1 });
                client.to(data.roomId).emit("start_game", { side: 2 });
                setInterval(() => {
                    update();
                    client.emit("on_game_update", {
                        player1,
                        player2,
                        ball,
                    });
                    client.to(data.roomId).emit("on_game_update", {
                        player1,
                        player2,
                        ball,
                    });
                }, 1000 / FPS);
            }
        }
    }
    async update(data, client) {
        const gameRoom = this.getSocketGameRoom(client);
        client.to(gameRoom).emit("on_game_update", data);
    }
    async updatePlayerPosition(data, client) {
        const gameRoom = this.getSocketGameRoom(client);
        if (data.side === 1) {
            player1.y = data.y;
        }
        else {
            player2.y = data.y;
        }
        client.to(gameRoom).emit("on_game_update", { player1, player2, ball });
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketEvents.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("leave_game"),
    __param(0, (0, websockets_2.MessageBody)()),
    __param(1, (0, websockets_2.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketEvents.prototype, "leave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("join_game"),
    __param(0, (0, websockets_2.MessageBody)()),
    __param(1, (0, websockets_2.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketEvents.prototype, "join", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("update_game"),
    __param(0, (0, websockets_2.MessageBody)()),
    __param(1, (0, websockets_2.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketEvents.prototype, "update", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("update_player_position"),
    __param(0, (0, websockets_2.MessageBody)()),
    __param(1, (0, websockets_2.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketEvents.prototype, "updatePlayerPosition", null);
SocketEvents = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "http://127.0.0.1:4000", credential: true
        }
    }),
    __metadata("design:paramtypes", [users_gateway_1.UsersGateway,
        rooms_service_1.RoomsService])
], SocketEvents);
exports.SocketEvents = SocketEvents;
//# sourceMappingURL=socketEvents.js.map