import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
cors: {
    origin: "http://127.0.0.1:4000", credential: true
}
})
export class RoleGateway {
  @WebSocketServer() server: Server;
  afterInit(server: Server) { }

  updateListChat(id: string) {
    this.server.to(id).emit("updateListChat", true);
  }
}