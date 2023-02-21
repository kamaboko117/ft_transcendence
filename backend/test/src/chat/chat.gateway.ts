import {
  SubscribeMessage, WebSocketGateway, MessageBody
  , ConnectedSocket, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CreateChatDto, Owner } from './create-chat.dto';
import { Chat, InformationChat, User, DbChat } from './chat.interface';
import { IsString } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './chat.entity';
import { ListBan } from './lstban.entity';
import { ListMsg } from './lstmsg.entity';
import { ListMute } from './lstmute.entity';
import { ListUser } from './lstuser.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UseGuards } from '@nestjs/common';

class Room {
  @IsString()
  id: string;
  @IsString()
  username: string;
  @IsString()
  name: string;
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
/*
const filterAccessPublic = (elem: Chat) => {
  if (elem.accesstype === "0" || elem.accesstype === "1")
    return (true);
  return (false);
}
*/

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000", credential: true
  }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  afterInit(server: Server) { }
  //private readonly publicChats: Chat[] = [];
  @InjectRepository(Channel)
  private chatsRepository: Repository<Channel>;
  @InjectRepository(ListUser)
  private listUserRepository: Repository<ListUser>;
  @InjectRepository(ListMsg)
  private listMsgRepository: Repository<ListMsg>;
  /*
    async onModuleInit() {
      //remplacer any[] par Chat[] quand mute et ban
      let arr: Channel[] = await this.chatsRepository.find();
      //console.log(arr);
      //
      arr.forEach(async (element) => {*/
  /* LOAD MSGS BY CHANNEL */
  /*const lstMsg: ListMsg[] = await this.listMsgRepository
    .createQueryBuilder("list_msg")
    .select(['list_msg.user_id',
      'list_msg.username', 'list_msg.content'])
    .innerJoin("list_msg.chat", "lstMsg")
    .where("list_msg.chatid = :id")
    .setParameters({ id: element.id })
    .getMany();
    */
  /* LOAD USERS BY CHANNEL */
  /* const lstUser: ListUser[] = await this.listUserRepository
     .createQueryBuilder("list_user")
     .select(['list_user.user_id',])
     .innerJoin("list_user.chat", "lstUsr")
     .where("list_user.chatid = :id")
     .setParameters({ id: element.id })
     .getMany();
   console.log("arr: " + lstUser);*/
  /*let mapUser: Map<number | string, string> = new Map<string | number, string>;
  lstUser.forEach((elem: any) => {
    mapUser.set(elem.iduser, elem.username)
  })
  console.log("Map: " + mapUser);
  */
  /*this.publicChats.push({
     id: element.id,
     name: element.name,
     owner: element.user_id,
     accesstype: element.accesstype,
     password: element.password,
     lstMsg: lstMsg,
     lstUsr: mapUser,
     lstMute: new Map<string, number>,
     lstBan: new Map<string, number>,
   });*/
  /*  });
   // console.log(this.publicChats);
  }*/
  async getAllPublic(): Promise<any[]> {
    const arr: Channel[] = await this.chatsRepository
      .createQueryBuilder("channel")
      .innerJoin("channel.user", "User")
      .select(['channel.id',
        'channel.name', 'channel.user_id', 'channel.accesstype', "User.username"])
      .where("accesstype = :a1 OR accesstype = :a2")
      .setParameters({ a1: 0, a2: 1 })
      .getRawMany();
    console.log("pub");
    console.log(arr);
    return arr;
  }

  async getAllPrivate(id: Readonly<string>, userID: Readonly<number>): Promise<any[]> {
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
    console.log("user_id: " + userID);
    console.log("allP");
    console.log(arr);
    return arr;
    /*const arr: Channel[] = await this.chatsRepository
      .createQueryBuilder("channel")
      .innerJoin("channel.lstUsr", "ListUser")
      .innerJoinAndSelect("ListUser.user", "User")
      .select(["channel.id", "channel.name",
        'channel.user_id', "channel.accesstype", "User.username"])
      .where("(accesstype = :a1 OR accesstype = :a2) AND User.userID = :userID")// AND ListUser.user_id = :iduser")
      .setParameters({ a1: 2, a2: 3, userID: userID })
      .getMany();
    console.log("allP");
    console.log(arr);
    return arr;*/
  }
  /*getAllPublicByName(): InformationChat[] {
    let arrName: InformationChat[] = [];

    const size: number = this.publicChats.length;

    for (let i: number = 0; i < size; ++i) {
      arrName[i] = {
        id: this.publicChats[i].id, name: this.publicChats[i].name,
        owner: this.publicChats[i].owner, accesstype: this.publicChats[i].accesstype
      };
    }
    return arrName;
  }*/

  /*getChannelById(id: string): undefined | Chat {
    const elem: number = this.publicChats.findIndex(x => x.id == id)
    return (this.publicChats[elem]);
  }*/

  //"ListMsg.username", "ListMsg.content", "ListMsg.user_id"
  async getListMsgByChannelId(id: string) {
    const listMsg: Array<{
      user_id: number,
      //username: string, //à enlever pour un find dans repository
      content: string
    }> = await this.listMsgRepository.createQueryBuilder("list_msg")
      .select(["list_msg.user_id", "User.username", "list_msg.content"])
      //.innerJoin("list_msg.chat", "Channel")
      .innerJoin("list_msg.user", "User")
      .where("list_msg.chatid = :id")
      .setParameters({ id: id })
      .orderBy("list_msg.id", 'ASC')
      .getMany();
    return (listMsg);
  }

  async getChannelByTest(id: string): Promise<undefined | DbChat> {
    const channel: any = await this.chatsRepository
      .createQueryBuilder("channel")
      .select(["channel.id", "channel.name", "channel.accesstype",
        "channel.user_id", "channel.password"])
      .where("channel.id = :id")// AND ListUser.user_id = :iduser")
      .setParameters({ id: id })
      .getOne();
    return (channel);
  }
  async getChannelByName(name: string): Promise<undefined | DbChat> {
    // const elem: number = this.publicChats.findIndex(x => x.name == name)

    // return (this.publicChats[elem]);
    const channel: any = await this.chatsRepository.findOne({
      where: {
        name: name
      }
    });
    return (channel);
  }
  async getUserOnChannel(id: string, user_id: number) {
    const user: any = await this.chatsRepository
      .createQueryBuilder("channel")
      .innerJoin("channel.lstUsr", "ListUser")
      .innerJoinAndSelect("ListUser.user", "User")
      .select(["channel.id", "channel.name", "channel.accesstype", "User.username"])
      .where("(channel.id = :id AND User.userID = :user_id)")// AND ListUser.user_id = :iduser")
      .setParameters({ id: id, user_id: user_id })
      .getRawOne();
    return (user);
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
    //this.publicChats.push(newChat);
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
    listUsr.chat = channel;
    this.listUserRepository.save(listUsr);
    const return_chat: InformationChat = {
      channel_id: newChat.id,
      channel_name: newChat.name,
      //owner: newChat.owner,
      User_username: owner.username,
      channel_accesstype: newChat.accesstype,
    }
    return (return_chat);
  }

  setNewUserChannel(channel: Readonly<any>, user_id: Readonly<number>,
    data: Readonly<Room>): undefined | boolean {
    if (channel.password != '') {
      if (data.psw === "" || data.psw === null)
        return (undefined)
      const comp = bcrypt.compareSync(data.psw, channel.password);
      if (comp === false)
        return (undefined)
    }
    //this.publicChats[idx].lstUsr.set(user_id, String(username));
    this.listUserRepository
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
    @MessageBody() data: Readonly<Room>): Promise<boolean> {
    const user = socket.user;

    if (typeof user.userID != "number")
      return (false);
    /*const index = this.publicChats.findIndex(x => x.id == data.id);
    console.log("index: " + index);
    if (index === -1)
      return (false);
    const channel: undefined | Chat = this.publicChats[index];
    */

    const channel: any = await this.chatsRepository.findOne({
      where: {
        id: data.id
      }
    });
    if (typeof channel != "undefined" && channel != null) {
      const getUser: any = await this.getUserOnChannel(data.id, user.userID);
      //const getUser = channel.lstUsr.get(user.userID);
      if (typeof getUser === "undefined" || getUser === null) {
        const newUser = this.setNewUserChannel(channel, user.userID, data);
        if (typeof newUser === "undefined") {
          return (false);
        }
      }
    }
    const getName = channel?.name;
    socket.join(data.id + getName);
    return (true);
  }
  @UseGuards(JwtGuard)
  @SubscribeMessage('leaveRoomChat')
  async leaveRoomChat(@ConnectedSocket() socket: Readonly<any>,
    @MessageBody() data: Readonly<Room>): Promise<string | undefined> {
    const user = socket.user;

    if (typeof user.userID != "number")
      return ("Couldn't' leave chat, wrong type id?");
    //const index = this.publicChats.findIndex(x => x.id == data.id);

    //if (index === -1)
    //  return (undefined);
    //const getUser = this.publicChats[index].lstUsr.get(user.userID);
    //if (typeof getUser === "undefined")
    //  return ("User not found");
    const getUser: any = await this.getUserOnChannel(data.id, user.userID);
    await this.chatsRepository
      .createQueryBuilder()
      .delete()
      .from(ListUser)
      .where("user_id = :id")
      .setParameters({ id: user.userID })
      .execute();
    const channel: any = await this.chatsRepository.findOne({
      where: {
        id: data.id
      }
    });
    const [listUsr, count]: any = await this.listUserRepository.findAndCountBy({ chatid: data.id })
    const getName = channel.name;
    socket.leave(data.id + getName);
    if (channel != undefined && count === 0)
      this.chatsRepository.delete(data);
    return (getUser.User_username + " left the chat");
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('stopEmit')
  async stopEmit(@ConnectedSocket() socket: Readonly<any>,
    @MessageBody() data: Readonly<any>) {
    const user = socket.user;
    //const getName = this.getChannelById(data.id)?.name;
    const getChannel: any = await this.getUserOnChannel(data.id, user.userID);
    console.log(getChannel);
    socket.leave(data.id + getChannel.channel_name);
  }//

  @UseGuards(JwtGuard)
  @SubscribeMessage('sendMsg')
  async newPostChat(@ConnectedSocket() socket: Readonly<any>,
    @MessageBody() data: Readonly<SendMsg>) {
    const user = socket.user;
    if (typeof user.userID != "number")
      return;
    //const chat: Chat[] = this.publicChats;
    //const index = chat.findIndex(x => x.id == data.id);
    //if (index === -1)
    //  return (undefined);
    //const getUsername = chat[index].lstUsr.get(user.userID);
    //if (typeof getUsername === "undefined")
    //  return ("User not found");
    //if typeChat === public
    //console.log("index: " + index);
    //chat[index].lstMsg.push({
    //  user_id: user.userID,
    //  username: getUsername, content: data.content
    //});
    const getUser = await this.getUserOnChannel(data.id, user.userID);
    console.log("gU");
    console.log(getUser);
    this.listMsgRepository
      .createQueryBuilder()
      .insert()
      .into(ListMsg)
      .values([{
        user_id: user.userID, //username: getUser.User_username,
        content: data.content,
        chatid: data.id
      }])
      .execute();
    /*//else if (typechat === private)
    console.log(chat[index].id + chat[index].name);
    const length = chat[index].lstMsg.length;
    console.log("chatId: " + chat[index].id + " chatName: " + chat[index].name);
    */
    this.server.to(getUser.channel_id + getUser.channel_name).emit("sendBackMsg", {
      user_id: user.userID,
      user: { username: getUser.User_username },
      //username: getUser.User_username,
      content: data.content
    });// chat[index].lstMsg[length - 1]);
  }

  /* Tests ws */
  handleConnection(client: Socket) {
    console.log("connect client id: " + client.id);
  }
  handleDisconnect(client: Socket) {
    console.log("disconnect client id: " + client.id);
  }
}
