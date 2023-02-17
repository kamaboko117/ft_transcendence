import {
  SubscribeMessage, WebSocketGateway, MessageBody
  , ConnectedSocket, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CreateChatDto, Owner } from './create-chat.dto';
import { Chat, InformationChat, User } from './chat.interface';
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
  idUser: number;
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
  idUser: number;
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
  private readonly publicChats: Chat[] = [];
  @InjectRepository(Channel)
  private chatsRepository: Repository<Channel>;
  @InjectRepository(ListUser)
  private listUserRepository: Repository<ListUser>;
  @InjectRepository(ListMsg)
  private listMsgRepository: Repository<ListMsg>;

  async onModuleInit() {
    //remplacer any[] par Chat[] quand mute et ban
    let arr: Channel[] = await this.chatsRepository.find();
    //console.log(arr);
    //
    arr.forEach(async (element) => {
      /* LOAD MSGS BY CHANNEL */
      const lstMsg: ListMsg[] = await this.listMsgRepository
        .createQueryBuilder("list_msg")
        .select(['list_msg.user_id',
          'list_msg.username', 'list_msg.content'])
        .innerJoin("list_msg.chat", "lstMsg")
        .where("list_msg.chatid = :id")
        .setParameters({ id: element.id })
        .getMany();
      console.log("msg: " + lstMsg);
      /* LOAD USERS BY CHANNEL */
      const lstUser: ListUser[] = await this.listUserRepository
        .createQueryBuilder("list_user")
        .select(['list_user.user_id',
          'list_user.username'])
        .innerJoin("list_user.chat", "lstUsr")
        .where("list_user.chatid = :id")
        .setParameters({ id: element.id })
        .getMany();
      console.log("arr: " + lstUser);
      let mapUser: Map<number | string, string> = new Map<string | number, string>;
      lstUser.forEach((elem: any) => {
        mapUser.set(elem.iduser, elem.username)
      })
      console.log("Map: " + mapUser);
      this.publicChats.push({
        id: element.id,
        name: element.name,
        owner: element.user_id,
        accesstype: element.accesstype,
        password: element.password,
        lstMsg: lstMsg,
        lstUsr: mapUser,
        lstMute: new Map<string, number>,
        lstBan: new Map<string, number>,
      });
    });
    console.log(this.publicChats);
  }
  async getAllPublic(): Promise<any[]> {
    const arr: Channel[] = await this.chatsRepository
      .createQueryBuilder("channel")
      .select(['channel.id',
        'channel.name', 'channel.user_id', 'channel.accesstype'])
      .where("accesstype = :a1 OR accesstype = :a2")
      .setParameters({ a1: 0, a2: 1 })
      .getMany();
    return arr;
  }
  async getAllPrivate(id: string): Promise<any[]> {
    console.log("ID: " + id);
    const arr: Channel[] = await this.chatsRepository
      .createQueryBuilder("channel")
      .select(['channel.id',
        'channel.name', 'channel.user_id', 'channel.accesstype'])
      .innerJoin("channel.lstUsr", "ListUser")
      .where("(accesstype = :a1 OR accesstype = :a2)")// AND ListUser.user_id = :iduser")
      .setParameters({ a1: 2, a2: 3, iduser: id })
      .getMany();
    return arr;
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

  getChannelById(id: string): undefined | Chat {
    const elem: number = this.publicChats.findIndex(x => x.id == id)
    return (this.publicChats[elem]);
  }
  getChannelByName(name: string): undefined | Chat {
    const elem: number = this.publicChats.findIndex(x => x.name == name)

    return (this.publicChats[elem]);
  }

  createPublic(chat: CreateChatDto, id: string, owner: Owner): InformationChat {
    chat.id = id;
    let newChat: Chat = {
      id: chat.id, name: chat.name, owner: owner.idUser,
      accesstype: chat.accesstype, password: chat.password,
      lstMsg: chat.lstMsg,
      lstUsr: chat.lstUsr, lstMute: chat.lstMute,
      lstBan: chat.lstBan
    };
    this.publicChats.push(newChat);
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
    listUsr.username = owner.username;
    listUsr.chat = channel;
    this.listUserRepository.save(listUsr);
    const return_chat: InformationChat = {
      id: newChat.id,
      name: newChat.name,
      owner: newChat.owner,
      accesstype: newChat.accesstype,
    }
    return (return_chat);
  }

  setNewUserChannel(idx: Readonly<number>,
    data: Readonly<Room>, username: string | undefined): undefined | Chat {
    console.log("setNewUserChannel");
    if (this.publicChats[idx].password != '') {
      if (data.psw === "" || data.psw === null)
        return (undefined)
      const comp = bcrypt.compareSync(data.psw, this.publicChats[idx].password);
      if (comp === false)
        return (undefined)
    }
    this.publicChats[idx].lstUsr.set(data.idUser, data.username);
    console.log("DATA:");
    console.log(data);
    this.listUserRepository
      .createQueryBuilder()
      .insert()
      .into(ListUser)
      .values([{
        user_id: data.idUser, username: username,
        chatid: data.id
      }])
      .execute();
    console.log("endNew");
    return (this.publicChats[idx]);
  }
  /* Socket part */
  @UseGuards(JwtGuard)
  @SubscribeMessage('joinRoomChat')
  async joinRoomChat(@ConnectedSocket() socket: Readonly<Socket>,
    @MessageBody() data: Readonly<Room>): Promise<boolean> {
    console.log("joinRoomChat");
    console.log(data);
    console.log("debut");
    if (typeof data.idUser != "number")
      return (false);
    const index = this.publicChats.findIndex(x => x.id == data.id);
    if (index === -1)
      return (false);
    const channel: undefined | Chat = this.publicChats[index];
    if (typeof channel != "undefined") {
      const getUser = channel.lstUsr.get(data.idUser);
      console.log("getUser:");
      console.log(getUser);
      if (typeof getUser === "undefined") {
        const newUser = this.setNewUserChannel(index, data, getUser);
        if (typeof newUser === "undefined") {
          console.log("join room undefined");
          return (false);
        }
      }
      else
        this.publicChats[index].lstUsr.set(data.idUser, data.username);
    }
    console.log("user add");
    const getName = channel?.name;
    socket.join(data.id + getName);
    console.log("fin");
    return (true);
  }
  @SubscribeMessage('leaveRoomChat')
  async leaveRoomChat(@ConnectedSocket() socket: Readonly<Socket>,
    @MessageBody() data: Readonly<Room>): Promise<string | undefined> {
    console.log(data);
    if (typeof data.idUser != "number")
      return ("Couldn't' leave chat, wrong type id?");
    const index = this.publicChats.findIndex(x => x.id == data.id);

    if (index === -1)
      return (undefined);
    const getUser = this.publicChats[index].lstUsr.get(data.idUser);
    if (typeof getUser === "undefined")
      return (data.username + " not found");
    this.chatsRepository
      .createQueryBuilder()
      .delete()
      .from(ListUser)
      .where("user_id = :id")
      .setParameters({ id: data.idUser })
      .execute();
    const getName = this.getChannelById(data.id)?.name;
    console.log("data.id: " + data.id + " name: " + getName);
    socket.leave(data.id + getName);
    if (this.publicChats[index] != undefined && this.publicChats[index].lstUsr.size === 0) {
      this.publicChats.splice(index, 1);
      this.chatsRepository.delete(data);
    }
    return (data.username + " left the chat");
  }
  @SubscribeMessage('stopEmit')
  async stopEmit(@ConnectedSocket() socket: Readonly<Socket>,
    @MessageBody() data: Readonly<any>) {
    const getName = this.getChannelById(data.id)?.name;
    socket.leave(data.id + getName);
  }//
  /* est-ce que je peux chercher l'user enregistré dans le gateway depuis le middleware? */
  @SubscribeMessage('sendMsg')
  newPostChat(@MessageBody() data: Readonly<SendMsg>) {
    if (typeof data.idUser != "number")
      return ;
    console.log(data);
    console.log("debut");
    const chat: Chat[] = this.publicChats;
    const index = chat.findIndex(x => x.id == data.id);
    if (index === -1)
      return (undefined);
    const getUsername = chat[index].lstUsr.get(data.idUser);
    if (typeof getUsername === "undefined")
      return ("User not found");
    console.log("milieux");
    //if typeChat === public
    console.log("index: " + index);
    chat[index].lstMsg.push({
      user_id: data.idUser,
      username: getUsername, content: data.content
    });
    console.log("data insert msg");
    this.listMsgRepository
      .createQueryBuilder()
      .insert()
      .into(ListMsg)
      .values([{
        user_id: data.idUser, username: getUsername,
        content: data.content,
        chatid: data.id
      }])
      .execute();
    //else if (typechat === private)
    console.log(chat[index].id + chat[index].name);
    const length = chat[index].lstMsg.length;
    console.log("chatId: " + chat[index].id + " chatName: " + chat[index].name);
    this.server.to(chat[index].id + chat[index].name).emit("sendBackMsg", chat[index].lstMsg[length - 1]);
    console.log("fin");
  }

  /* Tests ws */
  handleConnection(client: Socket) {
    console.log("connect client id: " + client.id);
  }
  handleDisconnect(client: Socket) {
    console.log("disconnect client id: " + client.id);
  }
  @SubscribeMessage('joinTestRoom')
  async handleJoinTest(@ConnectedSocket() client: Socket
    , server: Server): Promise<any> {
    console.log("event joinTestRoom");
    client.join(client.handshake.auth.token);
    client.broadcast.to(client.handshake.auth.token).emit('joinTestRoom'
      , 'client: ' + client.id + ' joined room');
    const sockets = this.server.sockets.adapter.rooms;
    console.log(sockets);
    return ("Joined test room");
  }
  @SubscribeMessage('events')
  handleEvents(@MessageBody() data: []
    , @ConnectedSocket() socket: Socket) {
    /*console.log(data);
    console.log(this.publicChats.length);
    console.log(socket.handshake.query);*/
    this.server.emit("events", socket.id);
  }
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
