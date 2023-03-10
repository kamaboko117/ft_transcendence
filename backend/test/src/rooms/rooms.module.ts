import { Module } from '@nestjs/common';
import { RoomsController } from './controllers/rooms/rooms.controller';
import { RoomsService } from './services/rooms/rooms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from 'src/typeorm/room.entity';
//import { Room } from 'src/typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([Room])],
  controllers: [RoomsController],
  providers: [RoomsService]
})
export class RoomsModule { }
