import {
  SubscribeMessage, WebSocketGateway, MessageBody
  , ConnectedSocket, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CreateChatDto, Owner } from './dto/create-chat.dto';
import { Chat, InformationChat, DbChat, TokenUser } from './chat.interface';
import { IsString } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Channel } from './chat.entity';
import { ListBan } from './lstban.entity';
import { ListMsg } from './lstmsg.entity';
import { ListMute } from './lstmute.entity';
import { ListUser } from './lstuser.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { BlackFriendList } from 'src/typeorm/blackFriendList.entity';

type Channel_ret = {
  Channel_id: string
}

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
class SendMsgPm {
  @IsString()
  id: string;
  @IsString()
  username: string;
  @IsString()
  content: string;
}*/

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
  afterInit(server: Server) { }
  @InjectRepository(Channel)
  private chatsRepository: Repository<Channel>;
  @InjectRepository(ListUser)
  private listUserRepository: Repository<ListUser>;
  @InjectRepository(ListMsg)
  private listMsgRepository: Repository<ListMsg>;
  @InjectRepository(ListBan)
  private listBanRepository: Repository<ListBan>;
  @InjectRepository(ListMute)
  private listMuteRepository: Repository<ListMute>;
  @InjectRepository(BlackFriendList)
  private readonly blFrRepository: Repository<BlackFriendList>

  private readonly mapSocket: Map<string, string>;

  constructor(private dataSource: DataSource,
    private authService: AuthService) {
    this.mapSocket = new Map();
  }

  getMap() {
    return (this.mapSocket);
  }

  async getAllPublic(): Promise<any[]> {
    const arr: Channel[] = await this.chatsRepository
      .createQueryBuilder("channel")
      .innerJoin("channel.user", "User")
      .select(['channel.id',
        'channel.name', 'channel.user_id', 'channel.accesstype', "User.username"])
      .where("accesstype = :a1 OR accesstype = :a2")
      .setParameters({ a1: 0, a2: 1 })
      .getRawMany();
    return arr;
  }

  async getAllPrivate(userID: Readonly<number>): Promise<any[]> {
    const arr: Channel[] = await this.chatsRepository
      .createQueryBuilder("channel")
      .innerJoin("channel.lstUsr", "ListUser")
      .innerJoin("ListUser.user", "User")
      .select(['channel.id', 'channel.name',
        'channel.user_id', 'channel.accesstype',
        'User.username'])
      .where("(accesstype = :a1 OR accesstype = :a2) AND ListUser.user_id = :userID")
      .setParameters({ a1: 2, a2: 3, userID: userID })
      .getRawMany();
    return arr;
  }

  /* PRIVATE MESSAGE PART */
  async getAllPmUser(userID: Readonly<number>) {
    const subquery = this.chatsRepository
      .createQueryBuilder("channel").subQuery()
      .from(Channel, "channel")
      .select("channel.id")
      .innerJoin("channel.lstUsr", "ListUser")
      .innerJoin("ListUser.user", "User")
      .where("channel.accesstype = :type", { type: '4' })
      .andWhere("ListUser.user_id = :user_id", { user_id: userID })

    const channel: ListUser[] | null = await this.listUserRepository
      .createQueryBuilder("list_user")
      .select("list_user.chatid")
      .addSelect("User.username")
      .innerJoin("list_user.user", "User")
      .where("list_user.chatid IN " + subquery.getQuery())
      .andWhere("list_user.user_id != :user_id")
      .setParameters({ type: '4', user_id: userID })
      .getMany();
    return (channel)
  }
  /* find and delete duplicate */
  async findDuplicateAndDelete(user_id: Readonly<string>) {
    const channel: {
      list_user_user_id: string,
      Channel_id: string,
      Channel_name: string
    } | undefined = await this.listUserRepository
      .createQueryBuilder("list_user")
      .select("list_user.user_id")
      .addSelect(["Channel.id", "Channel.name"])
      .innerJoin("list_user.chat", "Channel")
      .where("list_user.user_id = :id")
      .setParameters({ id: user_id })
      .andWhere("Channel.accesstype = :type")
      .setParameters({ type: '4' })
      .groupBy("list_user.user_id")
      .addGroupBy("Channel.id")
      .having("COUNT(list_user.user_id) >= :nb", { nb: 2 })
      .orHaving("COUNT(Channel.id) >= :otherNb", { otherNb: 2 })
      .getRawOne()

    if (channel) {
      await this.chatsRepository
        .createQueryBuilder()
        .delete()
        .from(Channel)
        .where("id = :id")
        .setParameters({ id: channel.Channel_id })
        .execute();
    }
  }

  /* GET PM BETWEEN 2 USERS BY NEEDED ID */
  async findPmUsers(userOne: Readonly<number>,
    userTwo: Readonly<string>) {
    const listUser: Channel_ret | undefined = await this.listUserRepository
      .createQueryBuilder("list_user")
      .select("Channel.id")
      .innerJoin("list_user.chat", "Channel")
      .where("list_user.user_id IN (:userOne, :userTwo)")
      .setParameters({
        userOne: userOne,
        userTwo: Number(userTwo)
      })
      .andWhere("Channel.accesstype = :type")
      .setParameters({ type: '4' })
      .groupBy("Channel.id")
      .orHaving("COUNT(Channel.id) >= :nb")
      .setParameters({ nb: 2 })
      .getRawOne();
    return (listUser);
  }

  /* GET PM BY USERNAME */

  /* Create private message part */
  async createPrivateMessage(userOne: Readonly<number>,
    userTwo: Readonly<string>): Promise<string> {
    let newChat: {
      id: number, name: string, accesstype: string
    } = {
      id: userOne + Number(userTwo),
      name: String(userOne + userTwo),
      accesstype: '4'
    };
    /* create Private message channel */
    await this.chatsRepository.createQueryBuilder()
      .insert().into(Channel)
      .values({
        id: String(userOne + userTwo),
        name: String(userOne + userTwo),
        accesstype: '4'
      })
      .execute();
    /* insert first user */
    await this.listUserRepository.createQueryBuilder()
      .insert().into(ListUser)
      .values([
        { user_id: userOne, chatid: String(userOne + userTwo) }
      ]).execute();
    /* insert second user */
    await this.listUserRepository.createQueryBuilder()
      .insert().into(ListUser)
      .values([
        { user_id: Number(userTwo), chatid: String(userOne + userTwo) }
      ]).execute();
    return (String(userOne) + userTwo);
  }
  /* END OF PRIVATE  */

  /* Get all channels where the user is registered, except privates messages */
  async getAllUserOnChannels(userID: Readonly<number>) {
    const channel: Channel[] | null = await this.chatsRepository
      .createQueryBuilder("channel")
      .select(["channel.id", "channel.name"])
      .innerJoin("channel.lstUsr", "ListUser")
      .where("(accesstype = :a1 OR accesstype = :a2 OR accesstype = :a3 OR accesstype = :a4) AND ListUser.user_id = :userID")
      .setParameters({ a1: 0, a2: 1, a3: 2, a4: 3, userID: userID })
      .getMany();
    return (channel);
  }

  async getListMsgByChannelId(id: string, userId: number) {
    const subQuery = this.blFrRepository.createQueryBuilder("bl")
      .subQuery()
      .from(BlackFriendList, "bl")
      .select("bl.focus_id")
      .where("bl.owner_id = :userId")
      .andWhere("bl.type_list = :type")

    const listMsg: Array<{
      user_id: number,
      content: string
    }> = await this.listMsgRepository.createQueryBuilder("list_msg")
      .select(["list_msg.user_id", "User.username", "User.avatarPath", "list_msg.content"])
      .innerJoin("list_msg.user", "User")
      .where("list_msg.chatid = :id")
      .setParameters({ id: id })
      .andWhere("list_msg.user_id NOT IN " + subQuery.getQuery())
      .setParameters({ userId: userId, type: 1 })
      .orderBy("list_msg.id", 'ASC')
      .getMany();
    return (listMsg);
  }

  async getChannelByTest(id: string): Promise<undefined | DbChat> {
    const channel: any = await this.chatsRepository
      .createQueryBuilder("channel")
      .select(["channel.id", "channel.name", "channel.accesstype",
        "channel.user_id", "channel.password"])
      .where("channel.id = :id")
      .setParameters({ id: id })
      .getOne();
    return (channel);
  }

  async getChannelByName(name: string): Promise<undefined | DbChat> {
    const channel: any = await this.chatsRepository.findOne({
      where: {
        name: name
      }
    });
    return (channel);
  }

  /* check if user is not muted */
  getUserMuted(id: string, user_id: number) {
    const user: Promise<ListMute | null> = this.listMuteRepository
      .createQueryBuilder("list_mute")
      .where("list_mute.chatid = :id")
      .setParameters({ id: id })
      .andWhere("list_mute.user_id = :user_id")
      .setParameters({ user_id: user_id })
      .andWhere("list_mute.time > :time")
      .setParameters({ time: "NOW()" })
      .getOne()
    return (user);
  }

  /* check if user is on channel and not banned */
  async getUserOnChannel(id: string, user_id: number) {
    const listBan: ListBan[] = await this.listBanRepository
      .createQueryBuilder("list_ban")
      .select("list_ban.user_id")
      .where("list_ban.user_id = :user_id")
      .setParameters({ user_id: user_id })
      .andWhere("list_ban.time > :time")
      .setParameters({ time: "NOW()" })
      .andWhere("list_ban.chatid = :id")
      .setParameters({ id: id })
      .getMany();
    if (listBan.length > 0)
      return ("Ban")
    const user: any = await this.chatsRepository
      .createQueryBuilder("channel")
      .innerJoin("channel.lstUsr", "ListUser")
      .innerJoinAndSelect("ListUser.user", "User")
      .select(["channel.id", "channel.name", "channel.accesstype", "Channel.user_id", "User.username", "User.avatarPath"])
      .where("channel.id = :id")
      .setParameters({ id: id })
      .andWhere("User.userID = :user_id")
      .setParameters({ user_id: user_id })
      .getRawOne();
    return (user);
  }

  /* join and subquery seem to not work with getMany() */
  async getAllUsersOnChannel(id: string, userId: number) {
    const bl = this.blFrRepository.createQueryBuilder("t1").subQuery()
      .from(BlackFriendList, "t1")
      .select(["focus_id", "type_list"])
      .where("owner_id = :ownerId"/*, { ownerId: userId }*/)
      .andWhere("type_list = :type1"/*, { type1: 1 }*/)
    const fl = this.blFrRepository.createQueryBuilder("t2").subQuery()
      .from(BlackFriendList, "t2")
      .select(["focus_id", "type_list"])
      .where("owner_id = :ownerId"/*, { ownerId: userId }*/)
      .andWhere("type_list = :type2"/*, { type2: 0 }*/)

    const arr: any = await this.listUserRepository
      .createQueryBuilder("list_user")
      .select(["list_user.user_id", "list_user.role"])
      .addSelect("User.username")
      .addSelect("t1.type_list AS bl")
      .addSelect("t2.type_list AS fl")
      .innerJoin("list_user.user", "User")
      .leftJoin(bl.getQuery(), "t1", "t1.focus_id = User.user_id")
      .setParameters({ type1: 1, ownerId: userId })
      .leftJoin(fl.getQuery(), "t2", "t2.focus_id = User.user_id")
      .setParameters({ type2: 2, ownerId: userId })
      .where("list_user.chatid = :id")
      .setParameters({ id: id })
      .orderBy("User.username", 'ASC')
      .getRawMany();
    return (arr);
  }

  createChat(chat: CreateChatDto, id: string, owner: Owner): InformationChat {
    chat.id = id;
    let newChat: Chat = {
      id: chat.id, name: chat.name, owner: owner.idUser,
      accesstype: chat.accesstype, password: chat.password,
      lstMsg: chat.lstMsg,
      lstUsr: chat.lstUsr, lstMute: chat.lstMute,
      lstBan: chat.lstBan
    };
    /* New Channel in DB */
    const channel = new Channel();
    channel.id = newChat.id;
    channel.name = newChat.name;
    channel.user_id = owner.idUser;
    channel.accesstype = newChat.accesstype;
    channel.password = newChat.password;
    /* Add owner */
    const listUsr = new ListUser();
    listUsr.user_id = owner.idUser;
    listUsr.role = "Owner";
    listUsr.chat = channel;
    this.listUserRepository.save(listUsr);

    const return_chat: InformationChat = {
      channel_id: newChat.id,
      channel_name: newChat.name,
      User_username: String(owner.username),
      channel_accesstype: newChat.accesstype,
    }
    return (return_chat);
  }

  async setNewUserChannel(channel: Readonly<any>, user_id: Readonly<number>,
    data: Readonly<Room>): Promise<undefined | boolean> {
    if (channel.password != '' && channel.password != null) {
      if (data.psw === "" || data.psw === null)
        return (undefined)
      const comp = bcrypt.compareSync(data.psw, channel.password);
      if (comp === false)
        return (undefined)
    }
    await this.listUserRepository
      .createQueryBuilder()
      .insert()
      .into(ListUser)
      .values([{
        user_id: user_id,
        chatid: data.id
      }])
      .execute();
    return (true);
  }

  /* Socket part */
  @UseGuards(JwtGuard)
  @SubscribeMessage('joinRoomChat')
  async joinRoomChat(@ConnectedSocket() socket: Readonly<any>,
    @MessageBody() data: Readonly<Room>): Promise<boolean | { ban: boolean }> {
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
      const getUser: any = await this.getUserOnChannel(data.id, user.userID);
      if (getUser === "Ban")
        return ({ ban: true });
      if (typeof getUser === "undefined" || getUser === null) {
        const newUser = await this.setNewUserChannel(channel, user.userID, data);
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
    @MessageBody() data: Readonly<Room>): Promise<string | undefined | { ban: boolean }> {
    const user: TokenUser = socket.user;

    if (typeof user.userID != "number")
      return ("Couldn't' leave chat, wrong type id?");
    const getUser: any = await this.getUserOnChannel(data.id, user.userID);
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
    @MessageBody() data: Readonly<any>) {
    const user = socket.user;
    if (typeof data === "undefined"
      || !user || typeof user.userID != "number")
      return;
    const getChannel: any = await this.getUserOnChannel(data.id, user.userID);
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
  async newPostChat(@ConnectedSocket() socket: Readonly<any>,
    @MessageBody() data: Readonly<SendMsg>) {
    const user = socket.user;

    if (typeof user.userID != "number")
      return;
    const getUser = await this.getUserOnChannel(data.id, user.userID);
    if (getUser === "Ban")
      return ({
        room: data.id,
        user_id: user.userID,
        user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
        content: "You are banned from this channel"
      });
    if (typeof getUser === "undefined" || getUser === null)
      return (undefined);
    const isMuted = await this.getUserMuted(data.id, user.userID);
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
      this.mapSocket.set(client.id, user.userID);
    }
  }
  handleDisconnect(client: Socket) {
    console.log("disconnect client id: " + client.id);
    this.mapSocket.delete(client.id);
  }
}
