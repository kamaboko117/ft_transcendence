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
import { TokenUser } from "src/chat/chat.interface";
import { UsersService } from "src/users/providers/users/users.service";
import { UpdateTypeRoom, UserIdRdy } from "./dto";

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

function resetBall(ball: IBall) {
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
    private readonly userService: UsersService,
    private readonly roomsService: RoomsService) {
    this.mapUserInGame = new Map();
  }
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log("Client connected: ", client.id);
    client.on("disconnecting", () => {
      client.rooms.forEach(async (key) => {
        const size = this.server.sockets.adapter.rooms.get(key)?.size;
        if (size === 1) {
          const room = await this.roomsService.getRoom(key);
          if (room)
            this.roomsService.deleteRoom(key);
        }
      });
    });
  }

  async handleDisconnect(client: Socket) {
    //const gameRoom: any = this.getSocketGameRoom(client);
    console.log("Client disconnected: ", client.id);
    for (let [key, value] of this.mapUserInGame.entries()) {
      if (client.id === key) {
        const userDb = await this.userService.findUsersById(Number(value));
        this.server.emit("user_leave_room", { username: userDb?.username });
      }
    }
    this.mapUserInGame.delete(client.id);
  }

  public isUserConnected(id: string) {
    const map = this.userGateway.getMap();

    for (let [key, value] of map.entries()) {
      if (value === id) {
        return (true);
      }
    }
    return (false);
  }

  public inviteUserToGame(userId: string, userIdFocus: string, idGame: string) {
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
  async leave(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log("client id: " + client.id + "is leaving room");
    if (data) {
      for (let [key, value] of this.mapUserInGame.entries()) {
        if (client.id === key) {
          const userDb = await this.userService.findUsersById(Number(value));
          console.log(userDb)
          this.server.to(data.roomId).emit("user_leave_room", { username: userDb?.username });
        }
      }
      client.leave(data.roomId);
      this.mapUserInGame.delete(client.id);
      const nbClient = this.server.sockets.adapter.rooms.get(data.roomId)?.size;
      if (!nbClient) {
        this.roomsService.deleteRoom(data.roomId);
      }
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
    const user: TokenUser = client.user;
    //await client.join(data.roomId);
    console.log("New user joining room: ", data);
    const userIdString: string = String(user.userID);
    //let findInMap: boolean = false;
    /*this.mapUserInGame.forEach((value, key) => {
      if (value === userIdString) {
        findInMap = true;
        return;
      }
    });*/
    for (let [key, value] of this.mapUserInGame.entries()) {
      if (value === userIdString) {
        this.server.to(client.id).emit("join_game_error", { error: "You are already in a party" });
        return;
      }
    }
    /*if (findInMap === true) {
      this.server.to(client.id).emit("join_game_error", { error: "You are already in a party" });
      return;
    }*/
    const connectedSockets = this.server.sockets.adapter.rooms.get(data.roomId);
    //const socketRooms = Array.from(client.rooms.values()).filter(
    //  (r) => r !== client.id
    //);
    const room = await this.roomsService.findRoomById(data.roomId);
    console.log(connectedSockets?.size)
    //j'enleve ca car le find fonctionne mal, il cherche sur toutes les rooms chat compris, 
    //si c pour trouver si deja en partie faut modifier
    console.log(this.mapUserInGame)

    //check if user is in a party

    if (/*socketRooms.length > 0
      || */(connectedSockets && connectedSockets?.size > 1)) {
      this.server.to(client.id).emit("join_game_error", { error: "Room is full" });
      return;
    } else {
      console.log(typeof data.roomId)
      await client.join(data.roomId);
      this.roomsService.updateRoomReady(data.roomId, false, true, true)
      this.mapUserInGame.set(client.id, userIdString);
      if (room && room.private === true) {
        const result: boolean = this.checkIfUserFound(room, client.id);
        //console.log("result: " + result)
        //console.log(this.server.sockets.adapter.rooms.get(data.roomId))
        if (result === false) {
          this.server.to(client.id).emit("join_game_error", { error: "You are spectactor" });
          return;
        }
      }
      /*console.log("lst id");
      console.log(this.server.sockets.adapter.rooms.get(data.roomId));
      console.log("map")
      console.log(this.mapUserInGame);
      console.log("nb client");
      const nbClient = this.server.sockets.adapter.rooms.get(data.roomId)?.size;
      
      this.server.to(data.roomId).emit("join_game_success", {
        roomId: data.roomId,
        username: user.username,
        nbClient: nbClient
      });*/
      console.log("--------")
      console.log(this.server.sockets.adapter.rooms.get(data.roomId));
      console.log(this.mapUserInGame);
      client.to(data.roomId).emit("updateUserRdy");
      const loop = this.server.sockets.adapter.rooms.get(data.roomId);
      //const nbClient = this.server.sockets.adapter.rooms.get(data.roomId)?.size;
      let i: number = 1;
      loop?.forEach((key) => {
        console.log(key)
        this.mapUserInGame.forEach(async (value2, key2) => {
          if (key === key2) {
            console.log("FOUND");
            const userDb = await this.userService.findUsersById(Number(value2));
            console.log(userDb)
            this.server.to(data.roomId).emit("join_game_success", {
              roomId: data.roomId,
              username: userDb?.username,
              nbClient: i
            });
            ++i;
          }
        });
      });
      /*if (connectedSockets?.size === 2) {
        let newGame = new Game(data.roomId);
        let player1 = newGame.player1;
        let player2 = newGame.player2;
        let ball = newGame.ball;
        games.push(newGame);
        console.log("Starting game");
        client.to(data.roomId).emit("start_game", { side: 1 });
        client.to(data.roomId).emit("start_game", { side: 2 });
        setInterval(() => {
          update(newGame);
          client.to(data.roomId).emit("on_game_update", {
            player1,
            player2,
            ball,
          });
          client.to(data.roomId).to(data.roomId).emit("on_game_update", {
            player1,
            player2,
            ball,
          });
        }, 1000 / FPS);
      }*/
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

  @UseGuards(JwtGuard)
  @SubscribeMessage("updateTypeGame")
  updateTypeGame(@MessageBody() data: UpdateTypeRoom, @ConnectedSocket() client: Socket) {
    //client.to().emit()
    console.log("data")
    console.log(data)
    client.to(data.roomId).emit("updateTypeGameFromServer", { type: data.type });
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage("userIsRdy")
  async gameIsRdy(@MessageBody() data: UserIdRdy, @ConnectedSocket() client: any) {
    const user: TokenUser = client.user;
    const connectedSockets = this.server.sockets.adapter.rooms.get(data.uid);

    console.log("data rdy")
    console.log(data)
    console.log("user")
    console.log(user)
    if (user.username === data.usr1)
      await this.roomsService.updateRoomReady(data.uid, data.rdy, true, false);
    else if (user.username === data.usr2)
      await this.roomsService.updateRoomReady(data.uid, data.rdy, false, true);
    //when two user are connected, and both are rdy, game must start
    const getRoom = await this.roomsService.getRoom(data.uid);
    if (connectedSockets?.size === 2
      && getRoom?.player_one_rdy === true
      && getRoom.player_two_rdy === true) {
      let newGame = new Game(data.uid);
      let player1 = newGame.player1;
      let player2 = newGame.player2;
      let ball = newGame.ball;
      games.push(newGame);
      console.log("Starting game");
      client.to(data.uid).emit("start_game", { side: 1 });
      client.to(data.uid).emit("start_game", { side: 2 });
      setInterval(() => {
        update(newGame);
        client.to(data.uid).emit("on_game_update", {
          player1,
          player2,
          ball,
        });
        client.to(data.uid).to(data.uid).emit("on_game_update", {
          player1,
          player2,
          ball,
        });
      }, 1000 / FPS);
    }
  }
}
