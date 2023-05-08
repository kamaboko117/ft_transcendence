import {
  Request,
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
  Query,
} from "@nestjs/common";
import { TokenUser } from "src/chat/chat.interface";
import { UserDeco, UserDecoSock } from "src/common/middleware/user.decorator";
import { CreateRoomDto, CreateRoomInvite, CreateRoomPrivate } from "src/rooms/dto/rooms.dtos";
import { RoomsService } from "src/rooms/services/rooms/rooms.service";
import { SocketEvents } from "src/socket/socketEvents";
import { UsersService } from "src/users/providers/users/users.service";

@Controller("rooms")
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly socketEvents: SocketEvents,
    private readonly userService: UsersService
  ) { }

  @Post("create")
  @UsePipes(ValidationPipe)
  createRoom(@UserDeco() user: TokenUser,
    @Body() createRoomDto: CreateRoomDto) {
    const regex = /^[\wàâéêèäÉÊÈÇç]+(?: [\wàâéêèäÉÊÈÇç]+)*$/;
    const resultRegex = regex.exec(createRoomDto.roomName);

    if (24 < createRoomDto.roomName.length) {
      return { err: "true", uid: "" }
    }
    if (!resultRegex) {
      return { err: "true", uid: "" }
    }
    const userId = user.userID;
    for (let [key, value] of this.socketEvents.getMap().entries()) {
      if (value === userId) {
        return { err: "You are already in a party", uid: "" }
      }
    }
    /*const userIdString: string = String(user.userID);
    this.socketEvents.getMap().forEach((value, key) => {
        if (value === userIdString) {
            findInMap = true;
            return;
        }
    });
    console.log("find: " + findInMap)
    if (findInMap === true) {
        return { err: "Already in a party", uid: "" }
    }*/
    let settings = {
      powerUps: false,
      type: "Classic",
      goal: 11,
      speed: 5,
      acceleration: 0.1,
      ballSize: 10,
      ballColor: "WHITE",
    };

    createRoomDto.settings = settings;
    return this.roomsService.createRoom(createRoomDto);
  }

  @Post("create-private")
  @UsePipes(ValidationPipe)
  async createRoomPrivate(@UserDecoSock() user: TokenUser,
    @Body() createRoomDto: CreateRoomInvite
  ) {
    const name: string = String(user.userID) + "|" + String(createRoomDto.id);
    if (user.userID === createRoomDto.id) {
      return { roomName: "", Capacity: "0", private: false, uid: "" };
    }
    const userExist = await this.userService.findUsersById(createRoomDto.id);
    if (!userExist)
      return { roomName: "", Capacity: "0", private: false, uid: "" };
    const isUserConnected = this.socketEvents.isUserConnected(
      String(createRoomDto.id)
    );
    if (!isUserConnected)
      return { roomName: "", Capacity: "0", private: false, uid: "" };
    //let findInMap: boolean = false;
    const userId = user.userID;
    for (let [key, value] of this.socketEvents.getMap().entries()) {
      if (value === userId || value === createRoomDto.id) {
        return { roomName: "", Capacity: "0", private: false, uid: "" };
      }
    }
    const itm = await this.roomsService.createRoomPrivate(name);
    this.socketEvents.inviteUserToGame(
      String(user.userID),
      String(createRoomDto.id),
      itm.uid
    );
    return itm;
  }
  /*@Post("create-matchmaking")
  @UsePipes(ValidationPipe)
  async createRoomMatchmaking(@UserDeco() user: TokenUser,
    @Body() createRoomDto: CreateRoomPrivate) {
    const name: string = String(user.userID) + '|' + String(createRoomDto.id);
    if (user.userID === createRoomDto.id) {
      return ({ roomName: '', Capacity: '0', private: false, uid: '' });
    }
    const userExist = await this.userService.findUsersById(createRoomDto.id)
    if (!userExist)
      return ({ roomName: '', Capacity: '0', private: false, uid: '' });
    const isUserConnected = this.socketEvents.isUserConnected(String(createRoomDto.id));
    if (!isUserConnected)
      return ({ roomName: '', Capacity: '0', private: false, uid: '' });
    //let findInMap: boolean = false;
    const userId = user.userID;
    for (let [key, value] of this.socketEvents.getMap().entries()) {
      if (value === userId || value === createRoomDto.id) {
        return ({ roomName: '', Capacity: '0', private: false, uid: '' });
      }
    }
    const itm = await this.roomsService.createRoomMatchmaking(name);
    console.log(itm);
    this.socketEvents.inviteUserToGame(String(user.userID), String(createRoomDto.id), itm.uid);
    return (itm);
  }*/

  @Get("get")
  async getRoom(@Request() req: any, @Query("id") id: string) {
    const room = await this.roomsService.getRoom(id);

    if (!room) return { exist: false };
    return { exist: true };
  }

  @Get()
  getRooms() {
    return this.roomsService.getRooms();
  }

  @Get(":id")
  async getRoomById(@Request() req: any) {
    const user: TokenUser = req.user;
    const isUserConnected = this.socketEvents.isUserConnected(
      String(user.userID)
    );
    if (!isUserConnected)
      return { roomName: "", Capacity: "0", private: false, uid: "" };
    return this.roomsService.findRoomById(req.params.id);
  }
}
