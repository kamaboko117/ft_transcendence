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

  /* id = id channel */
  actionOnUser(id: string, user_id: number,
    username: string, avatarPath: string, emit_name: string) {
    this.server.to(id).emit("actionOnUser", {
      room: id,
      user_id: user_id,
      user: { username: username, avatarPath: avatarPath },
      content: username + " is banned from this channel",
      type: emit_name
    });
    //2 for second chat if open by client
    this.server.to(id).emit("actionOnUser" + "2", {
      room: id,
      user_id: user_id,
      user: { username: username, avatarPath: avatarPath },
      content: username + " is banned from this channel",
      type: emit_name
    });
    //doit faire quitter socket de la room
  }
  /* id = id channel */
  updateListChat(id: string) {
    this.server.to(id).emit("updateListChat", true);
  }
}