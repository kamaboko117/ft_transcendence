import { Controller, Request, Query, Get, Post, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { InformationChat, User, DbChat } from './chat.interface';
import { CreateChatDto } from './create-chat.dto';
import { PswChat } from './psw-chat.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Channel } from './chat.entity';

@Controller('chat')
export class ChatController {
    constructor(private chatGateway: ChatGateway) { }
    /* Get part */
    @UseGuards(JwtGuard)
    @Get('public')
    getAllPublic(@Request() req: any): Promise<InformationChat[]> {
        return (this.chatGateway.getAllPublic());
    }

    @UseGuards(JwtGuard)
    @Get('private')
    async getAllPrivate(@Request() req: any,
        @Query('id') id: Readonly<string>): Promise<InformationChat[]> {
        const user: User = req.user;
        return (await this.chatGateway.getAllPrivate(id, user.userID));
    }

    @Get('users')
    async getAllUsersOnChannel(@Request() req: any,
        @Query('id') id: Readonly<string>) {
        //creer type listUser
        const listUsers: any = await this.chatGateway.getAllUsersOnChannel(id);
        if (typeof listUsers === "undefined" || listUsers === null)
            return (false);
        return (listUsers);
    }
    /*
        doit chercher le chat en fonction des 2 membres du chat
        doit retourner le chat
        doit check si le chat est bien retourner, si gateway retourne null ou undefined alors throw 
        forbidden
    */
    @Get('list-pm')
    async getDirectMessage(@Request() req: any) {
        const user: User = req.user;
        const channel: Channel[] | null 
            =  await this.chatGateway.getAllPmUser(user.userID);
        return (channel);
    }
    @Get('channel-registered')
    async getAllChanUser(@Request() req: any) {
        const user: User = req.user;
        const channel: Channel[] | null
            = await this.chatGateway.getAllUserOnChannels(user.userID);
        console.log(channel);
        return (channel);
    }
    /*
        id = id channel
        name = channel's name
    */
    @UseGuards(JwtGuard)
    @Get('has-paswd')
    async getHasPaswd(@Request() req: any,
        @Query('id') id: Readonly<string>): Promise<boolean> {
        const user: User = req.user;
        const channel: undefined | DbChat = await this.chatGateway.getChannelByTest(id);
        console.log(channel);
        if (typeof channel != "undefined" && channel != null) {
            console.log(channel);
            const getUser = await this.chatGateway.getUserOnChannel(id, user.userID);
            console.log(getUser);
            if (typeof getUser !== "undefined" || getUser === null)
                return (false);
        }
        if (typeof channel === "undefined" || channel?.password == '' || channel === null)
            return (false);
        return (true);
    }

    /* Post part */
    /* Create new public chat and return them by Name */
    /* admin pas fait */
    @UseGuards(JwtGuard)
    @Post('new-public')
    async postNewPublicChat(@Request() req: any,
        @Body() chat: CreateChatDto): Promise<InformationChat | string[]> {
        const user: User = req.user;
        const channel: undefined | DbChat = await this.chatGateway.getChannelByName(chat.name);
        let err: string[] = [];
        console.log()
        if ((chat.accesstype != '0' && chat.accesstype != '1'))
            err.push("Illegal access type");
        if (chat.name.length === 0)
            err.push("Chat name must not be empty.");
        else if (chat.name == chat.password)
            err.push("Password and chat name can't be the same.");
        console.log(channel);
        if (channel != null)//   || typeof channel === "undefined")
            err.push("Channel already exist.");
        if (err.length > 0)
            return (err);
        const getAll = await this.chatGateway.getAllPublic()
        const len: string = getAll.length.toString();
        let salt = 10; //DOIT ETRE UTILISE DEPUIS .env
        if (chat.accesstype != '0' || typeof getAll == undefined)
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (chat.password != '') {
            chat.accesstype = '1';
            chat.password = bcrypt.hashSync(chat.password, salt);
        }
        return (this.chatGateway.createChat(chat, len, { idUser: user.userID, username: user.username }));
    }

    /* Create new private chat and return them by Name */
    /* admin pas fait */
    /*
        https://nodejs.org/api/crypto.html#cryptorandombytessize-callback
    */
    @UseGuards(JwtGuard)
    @Post('new-private')
    async postNewPrivateChat(@Request() req: any,
        @Body() chat: CreateChatDto): Promise<InformationChat | string[]> {
        const user: User = req.user;
        const channel: undefined | DbChat = await this.chatGateway.getChannelByName(chat.name);
        let err: string[] = [];
        if ((chat.accesstype != '2' && chat.accesstype != '3'))
            err.push("Illegal access type");
        if (chat.name.length === 0)
            err.push("Chat name must not be empty.");
        else if (chat.name == chat.password)
            err.push("Password and chat name can't be the same.");
        if (channel != null || typeof channel === "undefined")
            err.push("Channel already exist.");
        if (err.length > 0)
            return (err);
        const id: string = crypto.randomBytes(4).toString('hex');
        let salt = 10;
        if (chat.password != '') {
            chat.accesstype = '3';
            chat.password = bcrypt.hashSync(chat.password, salt);
        }
        return (this.chatGateway.createChat(chat, id, { idUser: user.userID, username: user.username }));
    }

    @Post('valid-paswd')
    async passwordIsValid(@Body() psw: Readonly<PswChat>): Promise<boolean> {
        const channel: undefined | DbChat = await this.chatGateway.getChannelByTest(psw.id);
        if (typeof channel == "undefined" || channel === null || channel.password == '')
            return (false);
        const comp = await bcrypt.compare(psw.psw, channel.password);
        return (comp);
    }

    @Get('')
    async getChannel(@Request() req: any,
        @Query('id') id: Readonly<string>) {
        console.log("GET CHAN ID");
        const user: User = req.user;
        const chan = await this.chatGateway.getChannelByTest(id);
        const listMsg = await this.chatGateway.getListMsgByChannelId(id);

        let channel = {
            id: chan?.id,
            name: chan?.name,
            owner: chan?.user_id,
            password: chan?.password,
            accesstype: chan?.accesstype,
            lstMsg: listMsg
        };
        if (typeof channel === "undefined" || channel === null)
            return ({});
        const getUser = await this.chatGateway.getUserOnChannel(id, user.userID);
        if (typeof getUser === "undefined" || getUser === null)
            return ({});
        let arrayStart: number = channel.lstMsg.length - 5;
        let arrayEnd: number = channel.lstMsg.length;
        if (arrayStart < 0)
            arrayStart = 0;
        const convertChannel = {
            id: channel.id,
            name: channel.name,
            owner: channel.owner,
            accesstype: channel.accesstype,
            lstMsg: channel.lstMsg.slice(arrayStart, arrayEnd),
            authorized: true
        };
        return (convertChannel);
    }
}
