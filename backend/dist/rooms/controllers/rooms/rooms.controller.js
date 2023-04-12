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
exports.RoomsController = void 0;
const common_1 = require("@nestjs/common");
const rooms_dtos_1 = require("../../dto/rooms.dtos");
const rooms_service_1 = require("../../services/rooms/rooms.service");
const socketEvents_1 = require("../../../socket/socketEvents");
let RoomsController = class RoomsController {
    constructor(roomsService, socketEvents) {
        this.roomsService = roomsService;
        this.socketEvents = socketEvents;
    }
    getRooms() {
        return this.roomsService.getRooms();
    }
    createRoom(req, createRoomDto) {
        const user = req.user;
        return this.roomsService.createRoom(createRoomDto);
    }
    async createRoomPrivate(req, createRoomDto) {
        const user = req.user;
        const name = String(user.userID) + '|' + String(createRoomDto.id);
        if (user.userID === createRoomDto.id) {
            return ({ roomName: '', Capacity: '0', private: false, uid: '' });
        }
        const isUserConnected = await this.socketEvents.isUserConnected(String(createRoomDto.id));
        if (!isUserConnected)
            return ({ roomName: '', Capacity: '0', private: false, uid: '' });
        const itm = await this.roomsService.createRoomPrivate(name);
        console.log(itm);
        this.socketEvents.inviteUserToGame(String(user.userID), String(createRoomDto.id), itm.uid);
        return (itm);
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "getRooms", null);
__decorate([
    (0, common_1.Post)("create"),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, rooms_dtos_1.CreateRoomDto]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Post)("create-private"),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, rooms_dtos_1.CreateRoomPrivate]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "createRoomPrivate", null);
RoomsController = __decorate([
    (0, common_1.Controller)('rooms'),
    __metadata("design:paramtypes", [rooms_service_1.RoomsService,
        socketEvents_1.SocketEvents])
], RoomsController);
exports.RoomsController = RoomsController;
//# sourceMappingURL=rooms.controller.js.map