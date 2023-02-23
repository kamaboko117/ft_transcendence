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
import { User } from '../chat/chat.interface';

const { FifoMatchmaker } = require('matchmaking');

@WebSocketGateway({
  namespace: 'matchmaking',
})
export class MatchMakingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {}

  async handleConnection(client: Socket) 
  {
    console.log("client id: " + client.id + 'made a new connection Matchmaking Gateway');
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('queuein')
  async queuein(@ConnectedSocket() socket: Readonly<any>) {
    try {
      console.log('queue in');
      const user = socket.user;

      if (typeof user.userID != 'number') return false;


    } catch (error) {
      console.log('matchmaking failed');
      this.server.to(error.response.recipient).emit('matchmakingfailed', {
        message: error.response.message,
        match: error.response.match,
      });
      throw new WsException(error);
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
    } catch (error) {
      console.log('leaving queue failed');
      this.server.to(error.response.recipient).emit('queueoutfailed', {
        message: error.response.message,
        match: error.response.match,
      });
      throw new WsException(error);
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
      this.server.to(error.response.recipient).emit('acceptMMmatchfailed', {
        message: error.response.message,
        match: error.response.match,
      });
      throw new WsException(error);
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
      this.server.to(error.response.recipient).emit('declineMMmatchfailed', {
        message: error.response.message,
        match: error.response.match,
      });
      throw new WsException(error);
    }
  }

  @UseGuards(JwtGuard)
  handleDisconnect(client: Socket) {
    try {
      // leave the page? = leave queue
    } catch (error) {
      console.log('disconnect MM failed');
      this.server.to(error.response.recipient).emit('disconnectMMfailed', {
        message: error.response.message,
        match: error.response.match,
      });
      throw new WsException(error);
    }
  }
}
