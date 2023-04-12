import { JwtService } from '@nestjs/jwt';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import {
  Controller,
  Request,
  Req,
  Query,
  Param,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Logger,
  NotImplementedException
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { TokenUser } from '../chat/chat.interface';
import { SocketEvents } from 'src/socket/socketEvents';
import { RoomsService } from 'src/rooms/services/rooms/rooms.service';
import { CreateRoomDto, CreateRoomPrivate } from 'src/rooms/dto/rooms.dtos';
import { CustomMM } from './customMM/customMM';


type Match = {
  player1id: string;
  player2id: string;
  status : number;
};

@WebSocketGateway({
  cors: {
    origin: 'http://127.0.0.1:4000/ ',
    credential: true,
  },
})

export class MatchMakingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;
  afterInit(server: Server) {
    console.log('Matchmaking Gateway initialized');
  }

  private readonly MMSocket: Map<string, string>;
  private mmQueue: { [key: string]: TokenUser[] } = {};
  private mm : CustomMM<any>;

  constructor(private readonly roomsService: RoomsService, private readonly socketEvents: SocketEvents) {
    this.MMSocket = new Map();
    this.mm = new CustomMM(this.runGame, this.getKey, this, { checkInterval: 2000 });
  }


  async emitbackplayer2id(id1 : number, id2: number) {

    const name: string = String(id1) + '|' + String(id2);
    if (id1 === id2){
        return ({roomName: '', Capacity: '0', private: false, uid: ''});
    }
    const isUserConnected = await this.socketEvents.isUserConnected(String(id2));
    if (!isUserConnected)
        return ({roomName: '', Capacity: '0', private: false, uid: ''});
  const itm = await this.roomsService.createRoomPrivate(name);
  console.log(itm);
  this.socketEvents.MatchmakeUserToGame(String(id1), String(id2), itm.uid);

  }

  public catchresolver(players: any){
  this.emitbackplayer2id(players[0].id, players[1].id);
  }

  runGame(players : any) {

    console.log("Game started with:");
    console.log(players);
    console.log(players[0].id);

  }

  // 0=not in queue, 1=in queue, 2=in game
  public getPlayerStateMM(id : number) {
    return this.mm.getPlayerState(id);
  }

  wait(milliseconds : any){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
  }

  getKey(player: any) {
    return player.id;
  }

  async handleConnection(client: Socket) {
    console.log(
      'client id: ' + client.id + 'made a new connection Matchmaking Gateway',
    );
    client.join(client.id);
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('queuein')
  async queuein(@ConnectedSocket() socket: Readonly<any>) {
    try {
      let statep1=this.mm.getPlayerState(socket.user.userID); // 0=not in queue, 1=in queue, 2=in game
      if (statep1 == 2)
      {
        console.log("already in game");
        return;
      }
      if (statep1 == 1)
      {
        console.log("already in queue");
        return;
      }
      console.log('queue in');
      const user = socket.user;
      console.log("test");
      let player1 = { id:user.userID }
      this.mm.push(player1);

     // if (typeof user.userID != 'number') return false;
     
    } catch (error) {
      console.log(error);
      console.log('matchmaking failed');
      this.server.to(socket.id).emit('matchmakingfailed', {
        message: socket.id,
      });
    }
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('queueout')
  queueout(@ConnectedSocket() socket: Readonly<any>) {
    try {
      // leave queue here?
      console.log('queue out');
      const user = socket.user;

      if (typeof user.userID != 'number') return false;
      let player1 = { id:user.userID }
      this.mm.leaveQueue(player1);

    } catch (error) {
      console.log('leaving queue failed');
      this.server.to(socket.id).emit('queueoutfailed', {
        message: 'queue out failed',
      });
    }
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('acceptMMmatch')
  async accept(@ConnectedSocket() socket: Readonly<any>) {
    try {
      // leave queue here?
      console.log('accept match');
      const user = socket.user;
      // accepting matchmaking match after queue found a match

    } catch (error) {
      console.log('accept match failed');
      this.server.to(socket.id).emit('acceptMMmatchFailed', {
        message: 'accept MM match failed',
      });
    }
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('declineMMmatch')
  decline(@ConnectedSocket() socket: Readonly<any>) {
    try {
      // leave queue here?
      console.log('decline match');
      const user = socket.user;
      // refusing matchmaking match after queue found a match

    } catch (error) {
      console.log('decline match failed');
      this.server.to(socket.id).emit('declineMMmatchFailed', {
        message: 'decline match failed',
      });
    }
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('endGame')
  endGame(@ConnectedSocket() socket: Readonly<any>) {
    try {
      // leave queue here?
      console.log('remove from game');
      const user = socket.user;
      let player1 = { id:user.userID }
      this.mm.endGame(player1);

    } catch (error) {
      console.log('decline match failed');
      this.server.to(socket.id).emit('declineMMmatchFailed', {
        message: 'decline match failed',
      });
    }
  }
  @UseGuards(JwtGuard)
  handleDisconnect(@ConnectedSocket() socket: Readonly<any>) {
    try {
      // leave the page? = leave queue

      const user = socket.user;
      let player1 = { id:user.userID }
      this.mm.leaveQueue(player1);
    } catch (error) {
      console.log('disconnect MM failed');
      this.server.to(socket.id).emit('disconnect MM failed', {
        message: 'disconnect MM fail',
      });
    }
  }
}
