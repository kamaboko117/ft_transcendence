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
exports.MatchMakingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/jwt.guard");
const socketEvents_1 = require("../socket/socketEvents");
const rooms_service_1 = require("../rooms/services/rooms/rooms.service");
const fifo_1 = require("./customMM/fifo");
let MatchMakingGateway = class MatchMakingGateway {
    afterInit(server) {
        console.log('Matchmaking Gateway initialized');
    }
    constructor(roomsService, socketEvents) {
        this.roomsService = roomsService;
        this.socketEvents = socketEvents;
        this.mmQueue = {};
        this.MMSocket = new Map();
        this.mm = new fifo_1.FifoMatchmaker(this.runGame, this.getKey, this, { checkInterval: 2000 });
    }
    async emitbackplayer2id(id1, id2) {
        const name = String(id1) + '|' + String(id2);
        if (id1 === id2) {
            return ({ roomName: '', Capacity: '0', private: false, uid: '' });
        }
        const isUserConnected = await this.socketEvents.isUserConnected(String(id2));
        if (!isUserConnected)
            return ({ roomName: '', Capacity: '0', private: false, uid: '' });
        const itm = await this.roomsService.createRoomPrivate(name);
        console.log(itm);
        this.socketEvents.inviteUserToGame(String(id1), String(id2), itm.uid);
    }
    test(players) {
        console.log("calllzed by mmgateway!");
        console.log("test started with:");
        console.log(players);
        this.emitbackplayer2id(players[0].id, players[1].id);
    }
    runGame(players) {
        console.log("Game started with:");
        console.log(players);
        console.log(players[0].id);
    }
    wait(milliseconds) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }
    getKey(player) {
        return player.id;
    }
    async handleConnection(client) {
        console.log('client id: ' + client.id + 'made a new connection Matchmaking Gateway');
        client.join(client.id);
    }
    async queuein(socket) {
        try {
            console.log('queue in');
            const user = socket.user;
            console.log("test");
            let player1 = { id: user.userID };
            this.mm.push(player1);
        }
        catch (error) {
            console.log(error);
            console.log('matchmaking failed');
            this.server.to(socket.id).emit('matchmakingfailed', {
                message: socket.id,
            });
        }
    }
    queueout(socket) {
        try {
            console.log('queue out');
            const user = socket.user;
            if (typeof user.userID != 'number')
                return false;
            let player1 = { id: user.userID };
            this.mm.leaveQueue(player1);
        }
        catch (error) {
            console.log('leaving queue failed');
            this.server.to(socket.id).emit('queueoutfailed', {
                message: 'queue out failed',
            });
        }
    }
    async accept(socket) {
        try {
            console.log('accept match');
            const user = socket.user;
        }
        catch (error) {
            console.log('accept match failed');
            this.server.to(socket.id).emit('acceptMMmatchFailed', {
                message: 'accept MM match failed',
            });
        }
    }
    decline(socket) {
        try {
            console.log('decline match');
            const user = socket.user;
        }
        catch (error) {
            console.log('decline match failed');
            this.server.to(socket.id).emit('declineMMmatchFailed', {
                message: 'decline match failed',
            });
        }
    }
    handleDisconnect(socket) {
        try {
            const user = socket.user;
            let player1 = { id: user.userID };
            this.mm.leaveQueue(player1);
        }
        catch (error) {
            console.log('disconnect MM failed');
            this.server.to(socket.id).emit('disconnect MM failed', {
                message: 'disconnect MM fail',
            });
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MatchMakingGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, websockets_1.SubscribeMessage)('queuein'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MatchMakingGateway.prototype, "queuein", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, websockets_1.SubscribeMessage)('queueout'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MatchMakingGateway.prototype, "queueout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, websockets_1.SubscribeMessage)('acceptMMmatch'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MatchMakingGateway.prototype, "accept", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, websockets_1.SubscribeMessage)('declineMMmatch'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MatchMakingGateway.prototype, "decline", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MatchMakingGateway.prototype, "handleDisconnect", null);
MatchMakingGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: 'http://127.0.0.1:4000/ ',
            credential: true,
        },
    }),
    __metadata("design:paramtypes", [rooms_service_1.RoomsService, socketEvents_1.SocketEvents])
], MatchMakingGateway);
exports.MatchMakingGateway = MatchMakingGateway;
//# sourceMappingURL=matchmaking.gateway.js.map