import {
  SubscribeMessage, WebSocketGateway, MessageBody
  , ConnectedSocket, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MatchmakingService } from './matchmaking.service';
import { CreateMatchmakingDto } from './dto/create-matchmaking.dto';
import { UpdateMatchmakingDto } from './dto/update-matchmaking.dto';

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000", credential: true
  }
})

export class MatchmakingGateway {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @SubscribeMessage('createMatchmaking')
  create(@MessageBody() createMatchmakingDto: CreateMatchmakingDto) {
    return this.matchmakingService.create(createMatchmakingDto);
  }

  @SubscribeMessage('findAllMatchmaking')
  findAll() {
    return this.matchmakingService.findAll();
  }

  @SubscribeMessage('findOneMatchmaking')
  findOne(@MessageBody() id: number) {
    return this.matchmakingService.findOne(id);
  }

  @SubscribeMessage('updateMatchmaking')
  update(@MessageBody() updateMatchmakingDto: UpdateMatchmakingDto) {
    return this.matchmakingService.update(updateMatchmakingDto.id, updateMatchmakingDto);
  }

  @SubscribeMessage('removeMatchmaking')
  remove(@MessageBody() id: number) {
    return this.matchmakingService.remove(id);
  }
}
