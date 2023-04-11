import { CreateRoomDto, CreateRoomPrivate } from 'src/rooms/dto/rooms.dtos';
import { RoomsService } from 'src/rooms/services/rooms/rooms.service';
import { SocketEvents } from 'src/socket/socketEvents';
export declare class RoomsController {
    private readonly roomsService;
    private readonly socketEvents;
    constructor(roomsService: RoomsService, socketEvents: SocketEvents);
    getRooms(): Promise<import("../../../typeorm/room.entity").Room[]>;
    createRoom(req: any, createRoomDto: CreateRoomDto): Promise<import("../../../typeorm/room.entity").Room>;
    createRoomPrivate(req: any, createRoomDto: CreateRoomPrivate): Promise<import("../../../typeorm/room.entity").Room | {
        roomName: string;
        Capacity: string;
        private: boolean;
        uid: string;
    }>;
}
