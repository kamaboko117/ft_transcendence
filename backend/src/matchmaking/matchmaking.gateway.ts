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
import { FifoMatchmaker } from './customMM/fifo';


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
  //private mm : typeof FifoMatchmaker;
  private mm : FifoMatchmaker<any>;

  constructor(private readonly roomsService: RoomsService, private readonly socketEvents: SocketEvents) {
    this.MMSocket = new Map();
    //this.mm = new FifoMatchmaker(this.runGame, this.getKey, { checkInterval: 2000 });
    this.mm = new FifoMatchmaker(this.runGame, this.getKey, { checkInterval: 2000 });
  }

    /*
  //Partie matchmaking queue in
    @UseGuards(JwtGuard)
  async handleConnection(client: Socket) {
    console.log("connect client id: " + client.id);
    const bearer = client.handshake.headers.authorization;
    if (bearer) {
      const user: any = await this.authService.verifyToken(bearer);
      if (user)
        this.mapSocket.set(client.id, user.userID);
    }
  }

  //Partie matchmaking queue out
  handleDisconnect(client: Socket) {
    console.log("disconnect client id: " + client.id);
    this.mapSocket.delete(client.id);
  }
}

*/


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
  this.socketEvents.inviteUserToGame(String(id1), String(id2), itm.uid);

  }

  test(){console.log("calllzed by rungame");}

  
  runGame(players : any) {

    console.log("Game started with:");
    console.log(players);
    console.log(players[0].id);
 
    //this.emitbackplayer2id(players[0].id, players[1].id);
  
    /*
    let id1 = players[0].id;
    let id2 = players[1].id;

    const name: string = String(id1) + '|' + String(id2);
    if (id1 === id2){
        return ({roomName: '', Capacity: '0', private: false, uid: ''});
    }
    const isUserConnected = await this.socketEvents.isUserConnected(String(id2));
    if (!isUserConnected)
        return ({roomName: '', Capacity: '0', private: false, uid: ''});
  const itm = await this.roomsService.createRoomPrivate(name);
  console.log(itm);
  this.socketEvents.inviteUserToGame(String(id1), String(id2), itm.uid);
*/

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
