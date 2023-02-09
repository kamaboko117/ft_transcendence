import { JwtService } from '@nestjs/jwt';
import {
    SubscribeMessage, WebSocketGateway, MessageBody
    , ConnectedSocket, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsException
  } from '@nestjs/websockets';
  import { Socket, Server } from 'socket.io';
import { HttpException, HttpStatus } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'matchmaking'
})
export class MatchMakingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) { }

  async handleConnection(client: Socket) {}

  @SubscribeMessage('queuein')
  async queuein(
    @ConnectedSocket() client: Socket,
  ) {
    try {
    // join queue here?
    // wait till match found then emit a match found? use gamemaker here?

      }
    catch (error: any) { 
        throw new HttpException({
          status: HttpStatus.FORBIDDEN,
          error: 'This is a custom message',
        }, HttpStatus.FORBIDDEN, {
          cause: error
        });
      }
  }

  @SubscribeMessage('queueout')
  queueout(@ConnectedSocket() client: Socket) {
    try {
        // leave queue here?
    
          }
         catch (error: any) { 
            throw new HttpException({
              status: HttpStatus.FORBIDDEN,
              error: 'This is a custom message',
            }, HttpStatus.FORBIDDEN, {
              cause: error
            });
          }
  }

  @SubscribeMessage('acceptMMmatch')
  async accept(@ConnectedSocket() client: Socket) {
    try {
        // accepting matchmaking match after queue found a match
    
          }
         catch (error: any) { 
            throw new HttpException({
              status: HttpStatus.FORBIDDEN,
              error: 'This is a custom message',
            }, HttpStatus.FORBIDDEN, {
              cause: error
            });
          }
  }

  @SubscribeMessage('declineMMmatch')
  decline(@ConnectedSocket() client: Socket) {
    try {
        // refusing matchmaking match after queue found a match
    
          }
         catch (error: any) { 
            throw new HttpException({
              status: HttpStatus.FORBIDDEN,
              error: 'This is a custom message',
            }, HttpStatus.FORBIDDEN, {
              cause: error
            });
          }
  }

  handleDisconnect(client: Socket){
    try {
        // leave the page? = leave queue
    
          }
         catch (error: any) { 
            throw new HttpException({
              status: HttpStatus.FORBIDDEN,
              error: 'This is a custom message',
            }, HttpStatus.FORBIDDEN, {
              cause: error
            });
          }
  }

}
