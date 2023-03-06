import { Injectable } from '@nestjs/common';
import { CreateMatchmakingDto } from './dto/create-matchmaking.dto';
//import { UpdateMatchmakingDto } from './dto/update-matchmaking.dto';

@Injectable()
export class MatchmakingService {
  create(createMatchmakingDto: CreateMatchmakingDto) {
    return 'This action adds a new matchmaking';
  }

  findAll() {
    return `This action returns all matchmaking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} matchmaking`;
  }

  /*update(id: number, updateMatchmakingDto: UpdateMatchmakingDto) {
    return `This action updates a #${id} matchmaking`;
    }*/

  remove(id: number) {
    return `This action removes a #${id} matchmaking`;
  }
}
