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
exports.MatchMakingService = void 0;
const common_1 = require("@nestjs/common");
const { FifoMatchmaker } = require('matchmaking');
let MatchMakingService = class MatchMakingService {
    runGame(players) {
        console.log("Game started with:");
        console.log(players);
    }
    constructor() {
        this.mmQueue = {};
        this.mm = new FifoMatchmaker(this.runGame, { checkInterval: 2000 });
    }
    createMatch(player1, player2) {
    }
    queuein(user, socket, server) {
        console.log(server.sockets.adapter.rooms);
    }
    queueout(user) {
        this.mm.leaveQueue(user.userID);
    }
    async acceptMatch(user) {
    }
    declineMatch(user) {
    }
    bothcheck(player1, player2) {
    }
};
MatchMakingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MatchMakingService);
exports.MatchMakingService = MatchMakingService;
//# sourceMappingURL=matchmaking.services.js.map