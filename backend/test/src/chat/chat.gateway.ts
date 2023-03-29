import {
  SubscribeMessage, WebSocketGateway, MessageBody
  , ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { TokenUser } from './chat.interface';
import { IsString } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Channel } from './chat.entity';
import { ListMsg } from './lstmsg.entity';
import { ListUser } from './lstuser.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from './chat.service';

class Room {
  @IsString()
  id: string;
  @IsString()
  psw: string
}

class SendMsg {
  @IsString()
  id: string;
  @IsString()
  username: string;
  @IsString()
  content: string;
}

/*
  middleware nestjs socket
  https://github.com/nestjs/nest/issues/637
  avec react context socket query token
  BONUS part https://dev.to/bravemaster619/how-to-use-socket-io-client-correctly-in-react-app-o65
*/

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000", credential: true
  }
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  //afterInit(server: Server) { }
  @InjectRepository(Channel)
  private chatsRepository: Repository<Channel>;
  @InjectRepository(ListUser)
  private listUserRepository: Repository<ListUser>;
  @InjectRepository(ListMsg)
  private listMsgRepository: Repository<ListMsg>;

  private readonly mapSocket: Map<string, string>;

  constructor(private dataSource: DataSource,
    private authService: AuthService, private chatService: ChatService) {
    this.mapSocket = new Map();
  }

  getMap() {
    return (this.mapSocket);
  }

  /* Socket part */
  @UseGuards(JwtGuard)
  @SubscribeMessage('joinRoomChat')
  async joinRoomChat(@ConnectedSocket() socket: Readonly<any>,
    @MessageBody() data: Room): Promise<boolean | { ban: boolean }> {
    const user = socket.user;

    if (typeof user.userID != "number")
      return (false);
    const channel: any = await this.chatsRepository.findOne({
      where: {
        id: data.id
      }
    });
    const getName = channel?.name;
    if (typeof channel != "undefined" && channel != null) {
      const getUser: any = await this.chatService.getUserOnChannel(data.id, user.userID);
      if (getUser === "Ban")
        return ({ ban: true });
      if (typeof getUser === "undefined" || getUser === null) {
        const newUser = await this.chatService.setNewUserChannel(channel, user.userID, data);
        if (typeof newUser === "undefined") {
          return (false);
        }
        this.server.to(data.id).emit("updateListChat", true);
      }
    }
    socket.join(data.id);
    return (true);
  }

  /* search list admin, and set one as new owner*/
  async searchAndSetAdministratorsChannel(id: string) {
    let listUser: ListUser[] = await this.listUserRepository.createQueryBuilder("list_user")
      .select(["list_user.id", "list_user.user_id"])
      .where("list_user.chatid = :id")
      .setParameters({ id: id })
      .andWhere("list_user.role = :role")
      .setParameters({ role: 'Administrator' })
      .getMany();

    if (listUser.length === 0) {
      listUser = await this.listUserRepository.createQueryBuilder("list_user")
        .select(["list_user.id", "list_user.user_id"])
        .where("list_user.chatid = :id")
        .setParameters({ id: id })
        .getMany();
    }
    if (listUser.length > 0) {
      await this.chatsRepository.createQueryBuilder().update(Channel)
        .set({ user_id: listUser[0].user_id })
        .where("id = :id")
        .setParameters({ id: id })
        .execute();
      await this.listUserRepository.createQueryBuilder().update(ListUser)
        .set({ role: "Owner" })
        .where("id = :id")
        .setParameters({ id: listUser[0].id })
        .execute();
    }
  }

  /* Delete current owner, and try to set a new one */
  async setNewOwner(userId: number, id: string, ownerId: string) {
    const runner = this.dataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();
    try {
      //remove user from channel
      await this.chatsRepository
        .createQueryBuilder()
        .delete()
        .from(ListUser)
        .where("user_id = :id")
        .setParameters({ id: userId })
        .execute();

      if (Number(ownerId) === userId) {
        //try set first admin as owner
        //if no admin, then first user on list channel become owner
        await this.searchAndSetAdministratorsChannel(id);
      }
      const channel: Channel | null = await this.chatsRepository.findOne({
        where: {
          id: id
        }
      });
      await runner.commitTransaction();
      return (channel);
    } catch (e) {
      await runner.rollbackTransaction();
    } finally {
      //doc want it released
      await runner.release();
    }
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('leaveRoomChat')
  async leaveRoomChat(@ConnectedSocket() socket: Readonly<any>,
    @MessageBody() data: Room): Promise<string | undefined | { ban: boolean }> {
    const user: TokenUser = socket.user;

    if (typeof user.userID != "number")
      return ("Couldn't' leave chat, wrong type id?");
    const getUser: any = await this.chatService.getUserOnChannel(data.id, user.userID);
    if (getUser === "Ban")
      return ({ ban: true });
    if (typeof getUser === "undefined" || getUser === null)
      return ("No user found");
    const channel = await this.setNewOwner(user.userID, data.id, getUser.user_id);
    const [listUsr, count]: any = await this.listUserRepository.findAndCountBy({ chatid: data.id });
    //const getName = channel?.name;
    socket.leave(data.id);
    this.server.to(data.id).emit("updateListChat", true);
    if (channel != undefined && channel != null && count === 0)
      this.chatsRepository.delete(data);
    return (getUser.User_username + " left the chat");
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('stopEmit')
  async stopEmit(@ConnectedSocket() socket: Readonly<any>,
    @MessageBody() data: any) {
    const user = socket.user;
    if (typeof data === "undefined"
      || !user || typeof user.userID != "number")
      return;
    const getChannel: any = await this.chatService.getUserOnChannel(data.id, user.userID);
    if (getChannel === "Ban") {
      socket.leave(data.id);
      return ({ ban: true });
    }
    if (typeof getChannel !== "undefined" && getChannel !== null) {
      socket.leave(data.id);
    }
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('sendMsg')
  async newPostChat(@ConnectedSocket() socket: any,
    @MessageBody() data: SendMsg) {
    const user = socket.user;

    if (typeof user.userID != "number")
      return;
    const getUser = await this.chatService.getUserOnChannel(data.id, user.userID);
    if (getUser === "Ban")
      return ({
        room: data.id,
        user_id: user.userID,
        user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
        content: "You are banned from this channel"
      });
    if (typeof getUser === "undefined" || getUser === null)
      return (undefined);
    const isMuted = await this.chatService.getUserMuted(data.id, user.userID);
    if (isMuted)
      return ({
        room: data.id,
        user_id: user.userID,
        user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
        content: "You are muted from this channel"
      });
    this.listMsgRepository
      .createQueryBuilder()
      .insert()
      .into(ListMsg)
      .values([{
        user_id: user.userID,
        content: data.content,
        chatid: data.id
      }])
      .execute();

    socket.to(data.id).emit("sendBackMsg", {
      room: data.id,
      user_id: user.userID,
      user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
      content: data.content
    });
    socket.to(data.id).emit("sendBackMsg2", {
      room: data.id,
      user_id: user.userID,
      user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
      content: data.content
    });
    return ({
      room: data.id,
      user_id: user.userID,
      user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
      content: data.content
    })
  }

  @UseGuards(JwtGuard)
  async handleConnection(client: Socket) {
    console.log("connect client id: " + client.id);
    const bearer = client.handshake.headers.authorization;
    if (bearer) {
      const user: any = await this.authService.verifyToken(bearer);
      if (user)
        this.mapSocket.set(client.id, user.userID);
    }
  }

  handleDisconnect(client: Socket) {
    console.log("disconnect client id: " + client.id);
    this.mapSocket.delete(client.id);
    this.mapSocket.forEach((value, key) => {
      this.server.to(key).emit("currentStatus", {
        code: 0
      });
    })
  }
}
