import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { UsersGateway } from "src/users/providers/users/users.gateway";
import { RoomsService } from "src/rooms/services/rooms/rooms.service";
import { Room } from "src/typeorm/room.entity";
import { Inject, UseGuards, forwardRef } from "@nestjs/common";
import { JwtGuard } from "src/auth/jwt.guard";

const FPS = 60;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
let games = [] as Game[];

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

interface IBall {
  x: number;
  y: number;
  radius: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  color: string;
}

interface IGame {
  id: string;
  player1: IPlayer;
  player2: IPlayer;
  ball: IBall;
}

class Player implements IPlayer {
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

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 100;
    this.color = "WHITE";
    this.score = 0;
    this.top = 0;
    this.bottom = 0;
    this.left = 0;
    this.right = 0;
  }
}

class Ball implements IBall {
  x: number;
  y: number;
  radius: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  color: string;
  constructor() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.radius = 10;
    this.speed = 5;
    this.velocityX = 5;
    this.velocityY = 5;
    this.color = "WHITE";
  }
}

class Game implements IGame {
  id: string;
  player1: IPlayer;
  player2: IPlayer;
  ball: IBall;
  constructor(id: string) {
    this.id = id;
    this.player1 = new Player(0, CANVAS_HEIGHT / 2 - 100 / 2);
    this.player2 = new Player(CANVAS_WIDTH - 10, CANVAS_HEIGHT / 2 - 100 / 2);
    this.ball = new Ball();
  }
}

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

function resetBall(ball : IBall) {
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

function update(game: IGame) {
  game.ball.x += game.ball.velocityX;
  game.ball.y += game.ball.velocityY;
  if (game.ball.y + game.ball.radius > CANVAS_HEIGHT || game.ball.y - game.ball.radius < 0) {
    game.ball.velocityY = -game.ball.velocityY;
  }
  let player = game.ball.x < CANVAS_WIDTH / 2 ? game.player1 : game.player2;
  if (collision(player, game.ball)) {
    let collidePoint = game.ball.y - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);
    let angleRad = (Math.PI / 4) * collidePoint;
    let direction = game.ball.x + game.ball.radius < CANVAS_WIDTH / 2 ? 1 : -1;
    game.ball.velocityX = direction * game.ball.speed * Math.cos(angleRad);
    game.ball.velocityY = game.ball.speed * Math.sin(angleRad);
    game.ball.speed += 0.1;
  }
  if (game.ball.x - game.ball.radius < 0) {
    game.player2.score++;
    resetBall(game.ball);
  } else if (game.ball.x + game.ball.radius > CANVAS_WIDTH) {
    game.player1.score++;
    resetBall(game.ball);
  }
}

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000", credential: true
  }
})
export class SocketEvents {
  private readonly mapUserInGame: Map<string, string>;
  constructor(
    @Inject(forwardRef(() => UsersGateway))
    private readonly userGateway: UsersGateway,
    private readonly roomsService: RoomsService) {
    this.mapUserInGame = new Map();
  }
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log("Client connected: ", client.id);
  }

  handleDisconnect(client: Socket) {
    console.log("Client disconnected: ", client.id);
    this.mapUserInGame.delete(client.id);
  }

  isUserConnected(id: string) {
    const map = this.userGateway.getMap();

    for (let [key, value] of map.entries()) {
      if (value === id) {
        return (true);
      }
    }
    return (false);
  }

  inviteUserToGame(userId: string, userIdFocus: string, idGame: string) {
    const map = this.userGateway.getMap();

    for (let [key, value] of map.entries()) {
      if (value === userIdFocus) {
        this.server.to(key).emit('inviteGame',
          { idGame: idGame, user_id: userId });
      }
    }
  }

  private getSocketGameRoom(socket: Socket): string | undefined {
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );
    return socketRooms[0];
  }

  @SubscribeMessage("leave_game")
  leave(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log("client id: " + client.id + "is leaving room");
    if (data) {
      client.leave(data.roomId);
      this.mapUserInGame.delete(client.id);
    }

  }

  /* search if user is in private room */
  checkIfUserFound(room: Room, clientId: string) {
    const map = this.userGateway.getMap();
    console.log(room);
    const split = room?.roomName.split('|');
    console.log(split)
    if (split) {
      for (let [key, value] of map.entries()) {
        if (key === clientId) {
          if (value === split[0] || value === split[1])
            return (true);
        }
      }
    }
    return (false);
  }
  @UseGuards(JwtGuard)
  @SubscribeMessage("join_game")
  async join(@MessageBody() data: any, @ConnectedSocket() client: any) {
    const user = client.user;
    //await client.join(data.roomId);
    console.log("New user joining room: ", data);
    console.log(this.server.sockets.adapter.rooms)

    const connectedSockets = this.server.sockets.adapter.rooms.get(data.roomId);
    const socketRooms = Array.from(client.rooms.values()).filter(
      (r) => r !== client.id
    );
    const room = await this.roomsService.findRoomById(data.roomId);
    console.log(connectedSockets?.size)
    //j'enleve ca car le find fonctionne mal, il cherche sur toutes les rooms chat compris, 
    //si c pour trouver si deja en partie faut modifier
    if (/*socketRooms.length > 0
      || */(connectedSockets && connectedSockets?.size > 1)) {
      client.emit("join_game_error", { error: "Room is full" });
      return;
    } else {
      await client.join(data.roomId);
      this.mapUserInGame.set(client.id, user.userID);
      if (room && room.private === true) {
        const result: boolean = this.checkIfUserFound(room, client.id);
        console.log("result: " + result)
        console.log(this.server.sockets.adapter.rooms.get(data.roomId))
        if (result === false) {
          client.emit("join_game_error", { error: "You are spectactor" });
          return;
        }
      }
      client.emit("join_game_success", { roomId: data.roomId });
      if (connectedSockets?.size === 2) {
        let newGame = new Game(data.roomId);
        let player1 = newGame.player1;
        let player2 = newGame.player2;
        let ball = newGame.ball;
        games.push(newGame);
        console.log("Starting game");
        client.emit("start_game", { side: 1 });
        client.to(data.roomId).emit("start_game", { side: 2 });
        setInterval(() => {
          update(newGame);
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
    const gameRoom: any = this.getSocketGameRoom(client);
    client.to(gameRoom).emit("on_game_update", data);
  }

  @SubscribeMessage("update_player_position")
  async updatePlayerPosition(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket
  ) {
    const gameRoom: any = this.getSocketGameRoom(client);
    let game = games.find((g) => g.id === gameRoom);
    if (!game) {
      return;
    }
    if (data.side === 1) {
      game.player1.y = data.y;
    } else {
      game.player2.y = data.y;
    }
    let player1 = game.player1;
    let player2 = game.player2;
    let ball = game.ball;
    console.log(`default player1: ${player1.x} ${player1.y}`);
    client.to(gameRoom).emit("on_game_update", { player1, player2, ball });
  }

  getMap() {
    return (this.mapUserInGame);
  }
}
