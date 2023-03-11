import { Request, Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { TokenUser } from 'src/chat/chat.interface';
import { CreateRoomDto } from 'src/rooms/dto/rooms.dtos';
import { RoomsService } from 'src/rooms/services/rooms/rooms.service';

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) { }

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
}
