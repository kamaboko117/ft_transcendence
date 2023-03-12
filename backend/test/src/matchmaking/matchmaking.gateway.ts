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
import { MatchMakingService } from './matchmaking.services';

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

  constructor(private readonly MMService: MatchMakingService) {}

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

      if (typeof user.userID != 'number') return false;

      this.MMService.queuein(user, socket, this.server);
    } catch (error) {
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

      this.MMService.queueout(user);
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
