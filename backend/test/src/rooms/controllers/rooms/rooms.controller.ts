import { Request, Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { TokenUser } from 'src/chat/chat.interface';
import { CreateRoomDto, CreateRoomPrivate } from 'src/rooms/dto/rooms.dtos';
import { RoomsService } from 'src/rooms/services/rooms/rooms.service';
import { SocketEvents } from 'src/socket/socketEvents';

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService,
        private readonly socketEvents: SocketEvents) { }

    @Get()
    getRooms() {
        return this.roomsService.getRooms();
    }

    @Post("create")
    @UsePipes(ValidationPipe)
    createRoom(@Request() req: any,
        @Body() createRoomDto: CreateRoomDto) {
        //si tu veux l user id
        const user: TokenUser = req.user;
        return this.roomsService.createRoom(createRoomDto);
    }

    @Post("create-private")
    @UsePipes(ValidationPipe)
    async createRoomPrivate(@Request() req: any,
        @Body() createRoomDto: CreateRoomPrivate) {
        const user: TokenUser = req.user;
        const name: string = String(user.userID) + '|' + String(createRoomDto.id);
        if (user.userID === createRoomDto.id){
            return ({roomName: '', Capacity: '0', private: false, uid: ''});
        }
        const isUserConnected = await this.socketEvents.isUserConnected(String(createRoomDto.id));
        if (!isUserConnected)
            return ({roomName: '', Capacity: '0', private: false, uid: ''});
        const itm = await this.roomsService.createRoomPrivate(name);
        console.log(itm);
        this.socketEvents.inviteUserToGame(String(user.userID), String(createRoomDto.id), itm.uid);
        return (itm);
    }
}
