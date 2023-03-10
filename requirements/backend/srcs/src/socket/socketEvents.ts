import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessageBody, ConnectedSocket } from "@nestjs/websockets";

const FPS = 60;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

interface IPlayer {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  score: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const player1 = {
  x: 0,
  y: CANVAS_HEIGHT / 2 - 100 / 2,
  width: 10,
  height: 100,
  color: "WHITE",
  score: 0,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};
const player2 = {
  x: CANVAS_WIDTH - 10,
  y: CANVAS_HEIGHT / 2 - 100 / 2,
  width: 10,
  height: 100,
  color: "WHITE",
  score: 0,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};
const ball = {
  x: CANVAS_WIDTH / 2,
  y: CANVAS_HEIGHT / 2,
  radius: 10,
  speed: 5,
  velocityX: 5,
  velocityY: 5,
  color: "WHITE",
};

function collision(player: IPlayer, ball: any) {
  player.top = player.y;
  player.bottom = player.y + player.height;
  player.left = player.x;
  player.right = player.x + player.width;

  ball.top = ball.y - ball.radius;
  ball.bottom = ball.y + ball.radius;
  ball.left = ball.x - ball.radius;
  ball.right = ball.x + ball.radius;

  return (
    ball.left < player.right &&
    ball.top < player.bottom &&
    ball.right > player.left &&
    ball.bottom > player.top
  );
}

function resetBall() {
  ball.x = CANVAS_WIDTH / 2;
  ball.y = CANVAS_HEIGHT / 2;
  ball.speed = 5;
  let newVelocityX = -ball.velocityX;
  let newVelocityY = -ball.velocityY;
  ball.velocityX = 0;
  ball.velocityY = 0;
  setTimeout(() => {
    ball.velocityX = newVelocityX;
    ball.velocityY = newVelocityY;
  }, 1500);
  console.log("velocityX: ", ball.velocityX);
}

function update() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;
  if (ball.y + ball.radius > CANVAS_HEIGHT || ball.y - ball.radius < 0) {
    ball.velocityY = -ball.velocityY;
  }
  let player = ball.x < CANVAS_WIDTH / 2 ? player1 : player2;
  if (collision(player, ball)) {
    let collidePoint = ball.y - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);
    let angleRad = (Math.PI / 4) * collidePoint;
    let direction = ball.x + ball.radius < CANVAS_WIDTH / 2 ? 1 : -1;
    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);
    ball.speed += 0.1;
  }
  if (ball.x - ball.radius < 0) {
    player2.score++;
    resetBall();
  } else if (ball.x + ball.radius > CANVAS_WIDTH) {
    player1.score++;
    resetBall();
  }
}

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
        setInterval(() => {
          update();
          client.emit("on_game_update", {
            player1,
            player2,
            ball,
          });
          client.to(data.roomId).emit("on_game_update", {
            player1,
            player2,
            ball,
          });
        }, 1000 / FPS);
      }
    }
  }

  @SubscribeMessage("update_game")
  async update(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const gameRoom = this.getSocketGameRoom(client);
    client.to(gameRoom).emit("on_game_update", data);
  }

  @SubscribeMessage("update_player_position")
  async updatePlayerPosition(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket
  ) {
    const gameRoom = this.getSocketGameRoom(client);
    if (data.side === 1) {
      player1.y = data.y;
    } else {
      player2.y = data.y;
    }
    client.to(gameRoom).emit("on_game_update", { player1, player2, ball });
  }
}
