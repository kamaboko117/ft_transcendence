import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "src/typeorm/room.entity";
import { Repository } from "typeorm";
import { CreateRoomDto } from "src/rooms/dto/rooms.dtos";
import { validate } from 'uuid';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>
  ) { }
  onModuleInit() {
    console.log("COUCOU ICI ROOM MODULE")
  }
  createRoom(CreateRoomDto: CreateRoomDto) {
    const newRoom = this.roomRepository.create(CreateRoomDto);
    return this.roomRepository.save(newRoom);
  }

  createRoomPrivate(name: string) {
    const newRoom =
      this.roomRepository.create({ roomName: name, private: true, matchmaking: false });
    return this.roomRepository.save(newRoom);
  }

  createRoomMatchmaking(name: string) {
    const newRoom =
      this.roomRepository.create({ roomName: name, private: true, matchmaking: true });
    return this.roomRepository.save(newRoom);
  }

  async getRooms() {
    const rooms = this.roomRepository.createQueryBuilder("room")
      .where("room.private = :type")
      .setParameters({ type: false })
      .getMany();
    return (await rooms);
  }

  findRoomById(uid: string) {
    return this.roomRepository.findOneBy({ uid: uid });
  }

  getRoom(uid: string) {
    if (validate(uid)) {
      const room = this.roomRepository.createQueryBuilder("room")
        .where("room.uid = :uid")
        .setParameters({ uid: uid })
        .getOne();

      return (room)
    }
    return (null);
  }

  async updateRoomReady(uid: string, rdy: boolean, p1: boolean, p2: boolean) {
    if (p1) {
      await this.roomRepository.createQueryBuilder()
        .update(Room)
        .set({ player_one_rdy: rdy })
        .where('uid = :uid', { uid: uid })
        .execute();
    }
    if (p2) {
      await this.roomRepository.createQueryBuilder()
        .update(Room)
        .set({ player_two_rdy: rdy })
        .where('uid = :uid', { uid: uid })
        .execute();
    }
  }

  async updateRoomTypeGame(uid: string, p1: boolean, p2: boolean, custom: boolean) {
    if (p1) {
      if (custom === true) {
        await this.roomRepository.createQueryBuilder()
          .update(Room)
          .set({ player_one_type_game: 'Custom' })
          .where('uid = :uid', { uid: uid })
          .execute();
      } else if (custom === false) {
        await this.roomRepository.createQueryBuilder()
          .update(Room)
          .set({ player_one_type_game: 'Classic' })
          .where('uid = :uid', { uid: uid })
          .execute();
      }
    }
    if (p2) {
      if (custom === true) {
        await this.roomRepository.createQueryBuilder()
          .update(Room)
          .set({ player_two_type_game: 'Custom' })
          .where('uid = :uid', { uid: uid })
          .execute();
      } else if (custom === false) {
        await this.roomRepository.createQueryBuilder()
          .update(Room)
          .set({ player_two_type_game: 'Classic' })
          .where('uid = :uid', { uid: uid })
          .execute();
      }
    }
  }

  async deleteRoom(uid: string) {
    await this.roomRepository.createQueryBuilder()
      .delete()
      .from(Room)
      .where("uid = :uid")
      .setParameters({ uid: uid })
      .execute();
  }

}
