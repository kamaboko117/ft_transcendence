import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "src/typeorm";
import { Repository } from "typeorm";
import { CreateRoomDto } from "src/rooms/dto/rooms.dtos";

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>
  ) {}

  createRoom(CreateRoomDto: CreateRoomDto) {
    const newRoom = this.roomRepository.create(CreateRoomDto);
    newRoom.Capacity = 1;
    return this.roomRepository.save(newRoom);
  }

  getRooms() {
    return this.roomRepository.find();
  }

  findRoomById(uid: string) {
    return this.roomRepository.findOneBy({uid: uid});
  }
}
