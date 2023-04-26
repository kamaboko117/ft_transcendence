import { Request, Body, Controller, Get, Post, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { TokenUser } from 'src/chat/chat.interface';
import { CreateRoomDto, CreateRoomPrivate } from 'src/rooms/dto/rooms.dtos';
import { RoomsService } from 'src/rooms/services/rooms/rooms.service';
import { SocketEvents } from 'src/socket/socketEvents';
import { UsersService } from 'src/users/providers/users/users.service';

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService,
        private readonly socketEvents: SocketEvents,
        private readonly userService: UsersService) { }

    

    @Post("create")
    @UsePipes(ValidationPipe)
    createRoom(@Request() req: any,
        @Body() createRoomDto: CreateRoomDto) {
        //si tu veux l user id
        const user: TokenUser = req.user;
        const regex = /^[\wàâéêèäÉÊÈÇç]+(?: [\wàâéêèäÉÊÈÇç]+)*$/;
        const resultRegex = regex.exec(createRoomDto.roomName);

        if (24 < createRoomDto.roomName.length){
            return {err: "true", uid: ""}
        }
        if (!resultRegex){
            return {err: "true", uid: ""}
        }
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
        const userExist = await this.userService.findUsersById(createRoomDto.id)
        if (!userExist)
            return ({roomName: '', Capacity: '0', private: false, uid: ''});
        const isUserConnected = this.socketEvents.isUserConnected(String(createRoomDto.id));
        if (!isUserConnected)
            return ({roomName: '', Capacity: '0', private: false, uid: ''});
        const itm = await this.roomsService.createRoomPrivate(name);
        console.log(itm);
        this.socketEvents.inviteUserToGame(String(user.userID), String(createRoomDto.id), itm.uid);
        return (itm);
    }
    
    @Get('get')
    async getRoom(@Request() req: any,
        @Query('id') id: string) {
        const room = await this.roomsService.getRoom(id);

        if (!room)
            return ({exist: false});
        return ({exist: true});
    }

    @Get()
    getRooms() {
        return this.roomsService.getRooms();
    }
}
