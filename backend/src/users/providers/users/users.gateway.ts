import { Body, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { IsNumber } from 'class-validator';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { JwtGuard } from 'src/auth/jwt.guard';

class Info {
  @IsNumber()
  userId: number
}

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000", credential: true
  }
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly mapSocket: Map<string, string>;
  constructor(private authService: AuthService) {
    this.mapSocket = new Map();
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('status')
  getStatusUser(@MessageBody() data: Info) {
    const map = this.mapSocket;

    /*map.forEach((value) => {
      console.log(value)
      console.log(data.userId)
      if (value === String(data.userId)) {
        console.log("equal")
        //check if in game
        //else return online
        return ({code: 1});
      }
    });*/
    for (let value of map.values()) {
      if (value === String(data.userId)) {
        console.log("equal")
        //check if in game
        //else return online
        return ({ code: 1 });
      }
    }
    return ({ code: 0 });
  }

  @UseGuards(JwtGuard)
  async handleConnection(client: Socket) {
    const bearer = client.handshake.headers.authorization;
    if (bearer) {
      const user: any = await this.authService.verifyToken(bearer);
      if (!user)
        return;
      this.mapSocket.forEach((value, key) => {
        this.server.to(key).emit("currentStatus", {
          code: 1, userId: user.userID
        });
      })
      if (user)
        this.mapSocket.set(client.id, user.userID);
    }
  }

  @UseGuards(JwtGuard)
  async handleDisconnect(client: Socket) {
    /*console.log("USER GATEWAY disconnect client id: " + client.id);
    const bearer = client.handshake.headers.authorization;
    console.log(bearer)
    if (bearer) {
      const user: any = await this.authService.verifyToken(bearer);
      console.log(user)
      if (!user)
        return;
      this.mapSocket.forEach((value, key) => {
        this.server.to(key).emit("currentStatus", {
          code: 0, userId: user.userID
        });
      })*/
    let found: undefined | string = undefined
    for (let [key, value] of this.mapSocket.entries()) {
      if (key === client.id) {
        found = value;
      }
    }
    if (found) {
      this.mapSocket.forEach((value, key) => {
        this.server.to(key).emit("currentStatus", {
          code: 0, userId: found
        });
      })
      this.mapSocket.delete(client.id);
    }
    //if (user)

    //}
  }

  getMap() {
    return (this.mapSocket);
  }
}