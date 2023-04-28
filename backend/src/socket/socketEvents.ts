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

interface IPowerUp {
  type: string;
  side: string;
  user: string;
  imageURL: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  active: boolean;
  lifespan: number;
  //a function that modifies the game
  effect: (dest: IGame | IPlayer) => void;
  cancelEffect: (dest: IGame | IPlayer) => void;
}

class powerUp implements IPowerUp {
  type: string;
  side: string;
  user: string;
  imageURL: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  active: boolean;
  lifespan: number;
  effect: (dest: IGame | IPlayer) => void;
  cancelEffect: (dest: IGame | IPlayer) => void;
  constructor(x: number, y: number, type: string) {
    switch (type) {
      case "ballSpeedUp":
        return new PUBallSpeedUp(x, y);
      case "ballSpeedDown":
        return new PUBallSpeedDown(x, y);
      case "ballGrow":
        return new PUBallGrow(x, y);
      case "ballShrink":
        return new PUBallShrink(x, y);
      case "paddleGrow":
        return new PUPaddleGrow(x, y);
      case "paddleShrink":
        return new PUPaddleShrink(x, y);
      case "ballSpeedUpPlayer":
        return new PUBallSpeedUpPlayer(x, y);
      case "ballSpeedDownPlayer":
        return new PUBallSpeedDownPlayer(x, y);
      default:
        throw new Error("Invalid power up type");
    }
  }
}

class PUNeutral implements IPowerUp {
  type: string;
  side: string;
  user: string;
  imageURL: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  active: boolean;
  lifespan: number;
  effect: (game: IGame) => void;
  cancelEffect: (game: IGame) => void;
  constructor(x: number, y: number) {
    this.type = "";
    this.side = "neutral";
    this.user = "";
    this.x = x;
    this.y = y;
    this.radius = 4;
    this.color = "BLUE";
    this.active = false;
    this.lifespan = 4;
    this.effect = (game: IGame) => { };
    this.cancelEffect = (game: IGame) => { };
  }
}

class PUBonus implements IPowerUp {
  type: string;
  side: string;
  user: string;
  target: IPlayer;
  imageURL: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  active: boolean;
  lifespan: number;
  effect: (player: IPlayer) => void;
  cancelEffect: () => void;
  constructor(x: number, y: number) {
    this.type = "";
    this.side = "bonus";
    this.user = "";
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.color = "GREEN";
    this.active = false;
    this.lifespan = 4;
    this.effect = (player: IPlayer) => { };
    this.cancelEffect = () => { };
  }
}

class PUMalus implements IPowerUp {
  type: string;
  side: string;
  user: string;
  target: IPlayer;
  imageURL: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  active: boolean;
  lifespan: number;
  effect: (player: IPlayer) => void;
  cancelEffect: () => void;
  constructor(x: number, y: number) {
    this.type = "";
    this.side = "malus";
    this.user = "";
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.color = "RED";
    this.active = false;
    this.lifespan = 4;
    this.effect = (player: IPlayer) => { };
    this.cancelEffect = () => { };
  }
}

class PUBallSpeedUp extends PUNeutral {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = "ballSpeedUp";
    this.imageURL =
      "https://cdn.discordapp.com/attachments/1036599465429172244/1100807862529314886/ballSpeed.png";
    this.effect = (game: IGame) => {
      game.ball.velocityX *= 1.5;
      game.ball.velocityY *= 1.5;
      game.ball.speed *= 1.5;
    };
    this.cancelEffect = (game: IGame) => {
      game.ball.velocityX /= 1.5;
      game.ball.velocityY /= 1.5;
      game.ball.speed /= 1.5;
    };
  }
}

class PUBallSpeedDown extends PUNeutral {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = "ballSpeedDown";
    this.imageURL =
      "https://cdn.discordapp.com/attachments/1036599465429172244/1100812835052851270/BallSlow.png";
    this.effect = (game: IGame) => {
      game.ball.velocityX /= 1.5;
      game.ball.velocityY /= 1.5;
      game.ball.speed /= 1.5;
    };
    this.cancelEffect = (game: IGame) => {
      game.ball.velocityX *= 1.5;
      game.ball.velocityY *= 1.5;
      game.ball.speed *= 1.5;
    };
  }
}

class PUBallGrow extends PUNeutral {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = "ballGrow";
    this.imageURL =
      "https://cdn.discordapp.com/attachments/1036599465429172244/1100811538039853178/BallGrow.png";
    this.effect = (game: IGame) => {
      game.ball.radius *= 2;
    };
    this.cancelEffect = (game: IGame) => {
      game.ball.radius /= 2;
    };
  }
}

class PUBallShrink extends PUNeutral {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = "ballShrink";
    this.imageURL =
      "https://cdn.discordapp.com/attachments/1036599465429172244/1100811538224398437/BallShrink.png";
    this.effect = (game: IGame) => {
      game.ball.radius /= 2;
    };
    this.cancelEffect = (game: IGame) => {
      game.ball.radius *= 2;
    };
  }
}

class PUPaddleGrow extends PUBonus {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = "paddleGrow";
    this.imageURL =
      "https://cdn.discordapp.com/attachments/1036599465429172244/1100807862768386190/PlayerGrow.png";
    this.effect = (player: IPlayer) => {
      this.target = player;
      player.height *= 1.5;
    };
    this.cancelEffect = () => {
      this.target.height /= 1.5;
    };
  }
}

class PUBallSpeedUpPlayer extends PUBonus {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = "ballSpeedUpPlayer";
    this.imageURL =
      "https://cdn.discordapp.com/attachments/1036599465429172244/1100807862529314886/ballSpeed.png";
    this.effect = (player: IPlayer) => {
      this.target = player;
      player.speedMultiplier *= 1.5;
    };
    this.cancelEffect = () => {
      this.target.speedMultiplier /= 1.5;
    };
  }
}

class PUPaddleShrink extends PUMalus {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = "paddleShrink";
    this.imageURL =
      "https://cdn.discordapp.com/attachments/1036599465429172244/1100807863061970996/PlayerShrink.png";
    this.effect = (player: IPlayer) => {
      this.target = player;
      player.height /= 1.5;
    };
    this.cancelEffect = () => {
      this.target.height *= 1.5;
    };
  }
}

class PUBallSpeedDownPlayer extends PUMalus {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = "ballSpeedDownPlayer";
    this.imageURL =
      "https://cdn.discordapp.com/attachments/1036599465429172244/1100812835052851270/BallSlow.png";
    this.effect = (player: IPlayer) => {
      this.target = player;
      player.speedMultiplier /= 1.5;
    };
    this.cancelEffect = () => {
      this.target.speedMultiplier *= 1.5;
    };
  }
}

const neutralPowerUpTypes = [
  "ballSpeedUp",
  "ballSpeedDown",
  "ballGrow",
  "ballShrink",
  "paddleGrow",
  "paddleShrink",
  "ballSpeedUpPlayer",
  "ballSpeedDownPlayer",
] as string[];

const bonusPowerUpTypes = ["paddleGrow", "ballSpeedUpPlayer"] as string[];

const malusPowerUpTypes = ["paddleShrink", "ballSpeedDownPlayer"] as string[];

interface IPlayer {
  socketId: string;
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
  speedMultiplier: number;
}

interface IBall {
  x: number;
  y: number;
  radius: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  color: string;
  acceleration: number;
}

interface IGame {
  id: string;
  intervalId: any;
  type: string;
  player1: IPlayer;
  player2: IPlayer;
  ball: IBall;
  goal: number;
  powerUps: IPowerUp[];
}

class Player implements IPlayer {
  socketId: string;
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
  speedMultiplier: number;

  constructor(x: number, y: number, id: string) {
    this.socketId = id;
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
    this.speedMultiplier = 1;
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
  acceleration: number;
  constructor(
    radius: number = 10,
    speed: number = 5,
    color: string = "WHITE",
    acceleration: number = 0.1
  ) {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.radius = radius;
    this.speed = speed;
    this.velocityX = 5;
    this.velocityY = 5;
    this.color = color;
    this.acceleration = acceleration;
  }
}

class Game implements IGame {
  id: string;
  intervalId: any;
  type: string;
  player1: IPlayer;
  player2: IPlayer;
  ball: IBall;
  goal: number;
  powerUps: IPowerUp[];
  constructor(id: string, player1id: string, player2id: string, goal: number) {
    this.id = id;
    this.type = "classic";
    this.player1 = new Player(0, CANVAS_HEIGHT / 2 - 100 / 2, player1id);
    this.player2 = new Player(
      CANVAS_WIDTH - 10,
      CANVAS_HEIGHT / 2 - 100 / 2,
      player2id
    );
    this.ball = new Ball();
    this.goal = goal;
    this.powerUps = [];
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

function generatePowerUps(game: IGame) {
  let powerUpSide = Math.floor(Math.random() * 3);
  let PU = {} as IPowerUp;
  const x = Math.random() * CANVAS_WIDTH;
  const y = Math.random() * CANVAS_HEIGHT;
  switch (powerUpSide) {
    case 0: //neutral
      var type =
        neutralPowerUpTypes[
        Math.floor(Math.random() * neutralPowerUpTypes.length)
        ];
      PU = new powerUp(x, y, type);
      break;
    case 1: //bonus
      var type =
        bonusPowerUpTypes[Math.floor(Math.random() * bonusPowerUpTypes.length)];
      PU = new powerUp(x, y, type);
      break;
    case 2: //malus
      var type =
        malusPowerUpTypes[Math.floor(Math.random() * malusPowerUpTypes.length)];
      PU = new powerUp(x, y, type);
      break;
  }
  game.powerUps.push(PU);
}

function checkPowerUpCollision(ball: IBall, powerUp: IPowerUp) {
  if (powerUp.active) return false;
  let distance = Math.sqrt(
    (ball.x - powerUp.x) * (ball.x - powerUp.x) +
    (ball.y - powerUp.y) * (ball.y - powerUp.y)
  );
  if (distance < ball.radius + powerUp.radius) {
    powerUp.user = ball.velocityX < 0 ? "player2" : "player1";
    return true;
  }
  return false;
}

function handleRound(game: IGame) {
  for (const powerUp of game.powerUps) {
    if (!powerUp.active) {
      powerUp.radius += 10;
    } else {
      powerUp.lifespan--;
      if (powerUp.lifespan === 0) {
        powerUp.cancelEffect(game);
        //remove power up from array
        game.powerUps.splice(game.powerUps.indexOf(powerUp), 1);
      }
    }
  }
  //generate a power up randomly with a 1/5 chance
  if (Math.floor(Math.random() * 5) === 0) {
    generatePowerUps(game);
  }
}

function resetBall(ball: IBall, game: IGame) {
  handleRound(game);
  ball.x = CANVAS_WIDTH / 2;
  ball.y = CANVAS_HEIGHT / 2;
  ball.speed = 5;
  // get ball direction before reset
  let angle = Math.atan2(ball.velocityY, ball.velocityX);
  let newVelocityX = -ball.speed * Math.cos(angle);
  let newVelocityY = -ball.speed * Math.sin(angle);
  ball.velocityX = 0;
  ball.velocityY = 0;
  setTimeout(() => {
    ball.velocityX = newVelocityX;
    ball.velocityY = newVelocityY;
  }, 1500);
}

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000",
    credential: true,
  },
})
export class SocketEvents {
  private readonly mapUserInGame: Map<string, number>;
  constructor(
    @Inject(forwardRef(() => UsersGateway))
    private readonly userGateway: UsersGateway,
    private readonly roomsService: RoomsService,
    private readonly userService: UsersService
  ) {
    this.mapUserInGame = new Map();
  }
  @WebSocketServer()
  server: Server;


  handleConnection(client: any) {
    const user: TokenUser = client.user;
    console.log("Client connected: ", client.id);
    client.on("disconnecting", () => {
      client.rooms.forEach(async (key: string) => {
        const room = this.server.sockets.adapter.rooms.get(key);
        const size = room?.size;
        //to make user leave room in db, need to know he is the only one in,
        //and make sure that, he is in the room 
        if (size === 1 && room) {
          const iterator = room?.values();
          if (room && client.id === iterator?.next().value) {
            const room = await this.roomsService.getRoom(key);
            if (room)
              this.roomsService.deleteRoom(key);
          }
        }
      });
    });
  }

  update(game: IGame) {
    game.ball.x += game.ball.velocityX;
    game.ball.y += game.ball.velocityY;
    if (
      (game.ball.y + game.ball.radius > CANVAS_HEIGHT &&
        game.ball.velocityY > 0) ||
      (game.ball.y - game.ball.radius < 0 && game.ball.velocityY < 0)
    ) {
      game.ball.velocityY = -game.ball.velocityY;
    }
    let player = game.ball.x < CANVAS_WIDTH / 2 ? game.player1 : game.player2;
    if (collision(player, game.ball)) {
      let collidePoint = game.ball.y - (player.y + player.height / 2);
      collidePoint = collidePoint / (player.height / 2);
      let angleRad = (Math.PI / 4) * collidePoint;
      let direction =
        game.ball.x + game.ball.radius < CANVAS_WIDTH / 2 ? 1 : -1;
      game.ball.speed += game.ball.acceleration;
      game.ball.velocityX =
        direction *
        game.ball.speed *
        Math.cos(angleRad) *
        player.speedMultiplier;
      game.ball.velocityY =
        game.ball.speed * Math.sin(angleRad) * player.speedMultiplier;
      handleRound(game);
    }
    //check if ball has collided with any power up
    for (const powerUp of game.powerUps) {
      if (checkPowerUpCollision(game.ball, powerUp) && !powerUp.active) {
        powerUp.active = true;
        if (powerUp.side === "neutral") {
          powerUp.effect(game);
        } else if (powerUp.side === "bonus") {
          let dest = game.ball.velocityX < 0 ? game.player2 : game.player1;
          powerUp.effect(dest);
        } else {
          let dest = game.ball.velocityX < 0 ? game.player1 : game.player2;
          powerUp.effect(dest);
        }
      }
    }
    if (game.ball.x - game.ball.radius < 0) {
      game.player2.score++;
      resetBall(game.ball, game);
    } else if (game.ball.x + game.ball.radius > CANVAS_WIDTH) {
      game.player1.score++;
      resetBall(game.ball, game);
    }
    if (game.player1.score === game.goal) {
      this.endGame(game, game.player1.socketId, game.player2.socketId);
    } else if (game.player2.score === game.goal) {
      this.endGame(game, game.player2.socketId, game.player1.socketId);
    }
  }

  async endGame(game: IGame, winnerSocketId: string, loserSocketId: string) {
    const winnerId = this.mapUserInGame.get(winnerSocketId);
    const loserId = this.mapUserInGame.get(loserSocketId);
    let winner = "";
    let loser = "";
    if (winnerId && loserId) {
      await this.userService.findUsersById(winnerId).then((user) => {
        if (user) winner = user.username;
      });
      await this.userService.findUsersById(loserId).then((user) => {
        if (user) loser = user.username;
      });
      await this.userService.updateHistory(
        game.type,
        winnerId,
        loserId,
        winnerId
      );
      await this.userService.updateAchive(winnerId);
      await this.userService.updateAchive(loserId);
    }
    this.server.to(game.id).emit("end_game", { winner: winner, loser: loser });
    console.log("clear interval: " + game.intervalId);
    clearInterval(game.intervalId);
    games = games.filter((g) => g.id !== game.id);
    this.mapUserInGame.delete(winnerSocketId);
    this.mapUserInGame.delete(loserSocketId);
    this.roomsService.deleteRoom(game.id);
  }

  findGameByConnectedSocket(socketId: string): null | IGame {
    let game = null;
    games.forEach((g) => {
      if (g.player1.socketId === socketId || g.player2.socketId === socketId) {
        game = g;
      }
    });
    return game;
  }

  async handleDisconnect(client: Socket) {
    console.log("Client disconnected: ", client.id);
    let game = this.findGameByConnectedSocket(client.id);
    if (game) {
      if (game.player1.socketId === client.id) {
        this.endGame(game, game.player2.socketId, game.player1.socketId);
      } else {
        this.endGame(game, game.player1.socketId, game.player2.socketId);
      }
      games = games.filter((g) => g.id !== game?.id);
    }
    else {
      const clientId = client.id;
      const map = this.mapUserInGame
      for (let [key, value] of map.entries()) {
        if (key === clientId) {
          const user = await this.userService.findUsersById(value);
          this.server.emit("user_leave_room", { username: user?.username });
        }
      }
      map.delete(client.id);
    }
  }

  public isUserConnected(id: string) {
    const map = this.userGateway.getMap();

    for (let [key, value] of map.entries()) {
      if (value === id) {
        return true;
      }
    }
    return false;
  }

  public inviteUserToGame(userId: string, userIdFocus: string, idGame: string) {
    const map = this.userGateway.getMap();

    for (let [key, value] of map.entries()) {
      if (value === userIdFocus) {
        this.server
          .to(key)
          .emit("inviteGame", { idGame: idGame, user_id: userId });
      }
    }
  }

  
  MatchmakeUserToGame(userId: string, userIdFocus: string, idGame: string) {
    const map = this.userGateway.getMap();

    for (let [key, value] of map.entries()) {
      if (value === userIdFocus) {
        this.server.to(key).emit('matchmakeGame',
          {idGame: idGame, user_id: userId});
      }
      if (value === userId) {
        this.server.to(key).emit('matchmakeGame',
          {idGame: idGame, user_id: userId});
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
          console.log(userDb);
          this.server
            .to(data.roomId)
            .emit("user_leave_room", { username: userDb?.username });
        }
      }
      client.leave(data.roomId);
      //this.mapUserInGame.delete(client.id);

      const game = this.findGameByConnectedSocket(client.id);
      if (game) {
        console.log();
        console.log(game);
        if (game.player1.socketId === client.id) {
          this.endGame(game, game.player2.socketId, game.player1.socketId);
        } else {
          this.endGame(game, game.player1.socketId, game.player2.socketId);
        }
        games = games.filter((g) => g.id !== game?.id);
      }
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
    const split = room?.roomName.split("|");
    if (split) {
      for (let [key, value] of map.entries()) {
        if (key === clientId) {
          if (value === split[0] || value === split[1]) return true;
        }
      }
    }
    return false;
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage("join_game")
  async join(@MessageBody() data: any, @ConnectedSocket() client: any) {
    const user: TokenUser = client.user;
    //await client.join(data.roomId);
    console.log("New user joining room: ", data);
    const userId: number = user.userID;
    //let findInMap: boolean = false;
    /*this.mapUserInGame.forEach((value, key) => {
      if (value === userIdString) {
        findInMap = true;
        return;
      }
    });*/
    for (let [key, value] of this.mapUserInGame.entries()) {
      if (value === userId) {
        this.server
          .to(client.id)
          .emit("join_game_error", { error: "You are already in a party" });
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
    //j'enleve ca car le find fonctionne mal, il cherche sur toutes les rooms chat compris,
    //si c pour trouver si deja en partie faut modifier
    console.log(this.mapUserInGame);

    //check if user is in a party

    if (
      /*socketRooms.length > 0
      || */ connectedSockets &&
      connectedSockets?.size > 1
    ) {
      this.server
        .to(client.id)
        .emit("join_game_error", { error: "Room is full" });
      return;
    } else {
      console.log(typeof data.roomId);
      await client.join(data.roomId);
      this.roomsService.updateRoomReady(data.roomId, false, true, true);
      this.roomsService.updateRoomTypeGame(data.roomId, true, true, false);
      this.mapUserInGame.set(client.id, userId);
      if (room && room.private === true) {
        const result: boolean = this.checkIfUserFound(room, client.id);
        //console.log("result: " + result)
        //console.log(this.server.sockets.adapter.rooms.get(data.roomId))
        if (result === false) {
          this.server
            .to(client.id)
            .emit("join_game_error", { error: "You are spectactor" });
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
      console.log("--------");
      console.log(this.server.sockets.adapter.rooms.get(data.roomId));
      console.log(this.mapUserInGame);
      client.to(data.roomId).emit("updateUserRdy");
      const loop = this.server.sockets.adapter.rooms.get(data.roomId);
      //const nbClient = this.server.sockets.adapter.rooms.get(data.roomId)?.size;
      let i: number = 1;
      loop?.forEach((key) => {
        console.log(key);
        this.mapUserInGame.forEach(async (value2, key2) => {
          if (key === key2) {
            console.log("FOUND");
            const userDb = await this.userService.findUsersById(Number(value2));
            console.log(userDb);
            this.server.to(data.roomId).emit("join_game_success", {
              roomId: data.roomId,
              username: userDb?.username,
              nbClient: i,
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
        let powerUps = newGame.powerUps;
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
            powerUps,
          });
          client.to(data.roomId).to(data.roomId).emit("on_game_update", {
            player1,
            player2,
            ball,
            powerUps,
          });
        }, 1000 / FPS);
      }*/
    }
  }

  // @SubscribeMessage("update_game")
  // async update(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
  //   const gameRoom: any = this.getSocketGameRoom(client);
  //   client.to(gameRoom).emit("on_game_update", data);
  // }

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
    client.to(gameRoom).emit("on_game_update", {
      player1,
      player2,
      ball,
      powerUps: game.powerUps,
    });
  }

  getMap() {
    return this.mapUserInGame;
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage("updateTypeGame")
  updateTypeGame(
    @MessageBody() data: UpdateTypeRoom,
    @ConnectedSocket() client: Socket
  ) {
    client
      .to(data.roomId)
      .emit("updateTypeGameFromServer", { type: data.type });
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage("userIsRdy")
  async gameIsRdy(
    @MessageBody() data: UserIdRdy,
    @ConnectedSocket() client: any
  ) {
    const user: TokenUser = client.user;
    const connectedSockets = this.server.sockets.adapter.rooms.get(data.uid);

    if (user.username === data.usr1) {
      await this.roomsService.updateRoomReady(data.uid, data.rdy, true, false);
      await this.roomsService.updateRoomTypeGame(data.uid, true, false, data.custom);
    }
    else if (user.username === data.usr2) {
      await this.roomsService.updateRoomReady(data.uid, data.rdy, false, true);
      await this.roomsService.updateRoomTypeGame(data.uid, false, true, data.custom);
    }
    //when two user are connected, and both are rdy, game must start
    const getRoom = await this.roomsService.getRoom(data.uid);
    if (connectedSockets?.size === 2
      && getRoom?.player_one_rdy === true
      && getRoom.player_two_rdy === true) {
      const getRoom = await this.roomsService.getRoom(data.uid);
      if (getRoom?.player_one_type_game != getRoom?.player_two_type_game)
        return { err: "Room type from both users not synchronized" };
      // console.log(connectedSockets)
      //let socket2 = connectedSockets?.values().next().value;
      let socket2: string | undefined = undefined;
      connectedSockets?.forEach((key) => {
        if (key !== client.id) socket2 = key;
      });
      if (socket2 === undefined) {
        return { err: "no socket second player found" };
      }
      let newGame = new Game(data.uid, client.id, socket2, 11);
      let powerUps = newGame.powerUps;
      let player1 = newGame.player1;
      let player2 = newGame.player2;
      let ball = newGame.ball;
      games.push(newGame);
      console.log("Starting game");
      client.emit("start_game", { side: 1 });
      client.to(data.uid).emit("start_game", { side: 2 });
      newGame.intervalId = setInterval(() => {
        this.update(newGame);
        client.emit("on_game_update", {
          player1,
          player2,
          ball,
          powerUps,
        });
        client.to(data.uid).to(data.uid).emit("on_game_update", {
          player1,
          player2,
          ball,
          powerUps,
        });
      }, 1000 / FPS);
    }
  }
}
