import {
  SubscribeMessage, WebSocketGateway, MessageBody
  , ConnectedSocket, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { isObject } from 'class-validator';
import { Socket, Server } from 'socket.io';
import { Chat } from './chat.interface';

@WebSocketGateway({
  cors: {
    origin: "http://localhost:4000", credential: true
  }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  afterInit(server: Server) { }
  private readonly publicChats: Chat[] = [];
  private readonly privateChats: Chat[] = [];

  getAllPublic(): Chat[] {
    return this.publicChats;
  }
  getAllPrivate(): Chat[] {
    return this.privateChats;
  }
  createPublic(chat: Chat, id: number) {
    chat.id = id;
    this.publicChats.push(chat);
  }
  createPrivate(chat: Chat, id: string): Chat {
    chat.id = id;
    //this.privateChats.find(this.pri);
    this.privateChats.push(chat);
    return (this.privateChats[this.privateChats.length - 1]);
  }

  /* Tests ws */
  handleConnection(client: Socket) {
    console.log("connect client id: " + client.id);
  }
  handleDisconnect(client: Socket) {
    console.log("disconnect client id: " + client.id);
  }
  @SubscribeMessage('joinTestRoom')
  handleJoinTest(@ConnectedSocket() client: Socket
    , server: Server): any {
    console.log("event joinTestRoom");
    client.join(client.handshake.auth.token);
    client.broadcast.to(client.handshake.auth.token).emit('roomCreated'
      , 'client: ' + client.id + ' joined room');
    const sockets = this.server.sockets.adapter.rooms;
    console.log(sockets);
    return ("Joined test room");
  }
  @SubscribeMessage('events')
  handleEvents(@MessageBody() data: []
    , @ConnectedSocket() client: Socket): [] {
    console.log("data: " + data);
    return (data);
  }
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}