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
  NotImplementedException,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { TokenUser } from '../chat/chat.interface';
const { FifoMatchmaker } = require('matchmaking');

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
  private mm : typeof FifoMatchmaker;

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

runGame(players : any) {
  console.log("Game started with:");
  console.log(players);
}
getKey(player: any) {
  return player.id;
}
  constructor() {
    this.MMSocket = new Map();
    this.mm = new FifoMatchmaker(this.runGame, this.getKey, { checkInterval: 2000 });
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
    } catch (error) {
      console.log('disconnect MM failed');
      this.server.to(socket.id).emit('disconnect MM failed', {
        message: 'disconnect MM fail',
      });
    }
  }
}
