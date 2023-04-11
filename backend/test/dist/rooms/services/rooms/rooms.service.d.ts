import { Room } from "src/typeorm/room.entity";
import { Repository } from "typeorm";
import { CreateRoomDto } from "src/rooms/dto/rooms.dtos";
export declare class RoomsService {
    private readonly roomRepository;
    constructor(roomRepository: Repository<Room>);
    createRoom(CreateRoomDto: CreateRoomDto): Promise<Room>;
    createRoomPrivate(name: string): Promise<Room>;
    getRooms(): Promise<Room[]>;
    findRoomById(uid: string): Promise<Room | null>;
}
