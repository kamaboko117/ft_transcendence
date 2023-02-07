import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateRoomDto } from 'src/rooms/dto/rooms.dtos';
import { RoomsService } from 'src/rooms/services/rooms/rooms.service';

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get()
    getRooms() {
        return this.roomsService.getRooms();
    }

    @Post("create")
    @UsePipes(ValidationPipe)
    createRoom(@Body() createRoomDto: CreateRoomDto) {
        return this.roomsService.createRoom(createRoomDto);
    }
}
