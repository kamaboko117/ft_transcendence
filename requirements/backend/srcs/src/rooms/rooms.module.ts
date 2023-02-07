import { Module } from '@nestjs/common';
import { RoomsController } from './controllers/rooms/rooms.controller';
import { RoomsService } from './services/rooms/rooms.service';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService]
})
export class RoomsModule {}
