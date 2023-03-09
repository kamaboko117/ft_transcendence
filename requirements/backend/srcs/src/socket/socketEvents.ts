import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessageBody, ConnectedSocket } from "@nestjs/websockets";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class SocketEvents {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log("Client connected: ", client.id);
  }

  handleDisconnect(client: Socket) {
    console.log("Client disconnected: ", client.id);
  }

  private getSocketGameRoom(socket: Socket): string | undefined {
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );
    return socketRooms[0];
  }

  @SubscribeMessage("join_game")
  async join(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log("New user joining room: ", data);

    const connectedSockets = this.server.sockets.adapter.rooms.get(data.roomId);
    const socketRooms = Array.from(client.rooms.values()).filter(
      (r) => r !== client.id
    );

    if (socketRooms.length > 0 || connectedSockets?.size > 1) {
      client.emit("join_game_error", { error: "Room is full" });
      return;
    } else {
      await client.join(data.roomId);
      client.emit("join_game_success", { roomId: data.roomId });
      if (connectedSockets?.size === 2) {
        console.log("Starting game");
        client.emit("start_game", { side: 1 });
        client.to(data.roomId).emit("start_game", { side: 2 });
      }
    }
  }

  @SubscribeMessage("update_game")
  async update(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const gameRoom = this.getSocketGameRoom(client);
    client.to(gameRoom).emit("on_game_update", data);
  }
}
