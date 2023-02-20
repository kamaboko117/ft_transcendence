import { Controller, Request, Req, Query, Param, Get, Post, Body, HttpException, HttpStatus, UseGuards, Logger } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { Chat, InformationChat, User, DbChat } from './chat.interface';
import { CreateChatDto } from './create-chat.dto';
import { PswChat } from './psw-chat.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtGuard } from 'src/auth/jwt.guard';

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
       // console.log(this.chatGateway.getAllPrivate(id));
        return (this.chatGateway.getAllPrivate(id, user.userID));
    }
    /*
        id = id channel
        name = channel's name
    */
    @UseGuards(JwtGuard)
    @Get('has-paswd')
    async getHasPaswd(@Request() req: any,
        @Query('id') id: Readonly<string>): Promise<boolean> {
            console.log("HAS PASW");
        const user: User = req.user;
        const channel: undefined | DbChat = await this.chatGateway.getChannelByTest(id);
        console.log(channel);
        if (typeof channel != "undefined" && channel != null) {
            console.log("channdqsqsd");
            console.log(channel);
            const getUser = await this.chatGateway.getUserOnChannel(id, user.userID);
            console.log(getUser);
            if (typeof getUser !== "undefined" || getUser === null)
                return (false);
            //const getUser = channel.lstUsr.get(user.userID);
           // console.log(getUser);
        }
     //   console.log("has-password channel");
     //   console.log(channel);
        if (typeof channel === "undefined" || channel?.password == '' || channel === null)
            return (false);
        return (true);
    }

    /* Post part */
    /* Create new public chat and return them by Name */
    /* admin pas fait */
    //@Guard() IL FAUT UN AUTHGUARD
    @UseGuards(JwtGuard)
    @Post('new-public')
    async postNewPublicChat(@Request() req: any,
        @Body() chat: CreateChatDto): Promise<InformationChat | string[]> {
        const user: User = req.user;
        const channel: undefined | DbChat = await this.chatGateway.getChannelByName(chat.name);
        console.log("channel");
        
        let err: string[] = [];

        if (chat.name.length === 0)
            err.push("Chat name must not be empty.");
        else if (chat.name == chat.password)
            err.push("Password and chat name can't be the same.");
        console.log(channel);
        if (channel != null || typeof channel === "undefined")
            err.push("Channel already exist.");
        if (err.length > 0)
            return (err);
        const getAll = await this.chatGateway.getAllPublic()
        const len: string = getAll.length.toString();
        let salt = 10; //DOIT ETRE UTILISE DEPUIS .env
        if (chat.accesstype != '0' || typeof getAll == undefined)
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        //chat.lstUsr = new Map<string | number, string>;
        //chat.lstMute = new Map<string, number>; //([[chat.setMute.key, chat.setMute.value]]);
        //chat.lstBan = new Map<string, number>; //([[chat.setBan.key, chat.setBan.value]]);
        //chat.lstUsr.set(user.userID, user.username);
        if (chat.password != '') {
            chat.accesstype = '1';
            chat.password = bcrypt.hashSync(chat.password, salt);
        }
     //   console.log(chat);
        return (this.chatGateway.createPublic(chat, len, {idUser: user.userID, username: user.username}));
        //console.log(this.chatGateway.getAllPublicByName());
        //return (this.chatGateway.getAllPublicByName());
    }

    /* Create new private chat and return them by Name */
    /* admin pas fait */
    //@Guard() IL FAUT UN AUTHGUARD
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
        //chat.lstUsr = new Map<string | number, string>;
        //chat.lstMute = new Map<string, number>; //([[chat.setMute.key, chat.setMute.value]]);
        //chat.lstBan = new Map<string, number>; //([[chat.setBan.key, chat.setBan.value]]);
        //chat.lstUsr.set(user.userID, user.username);
        /*
            appeler createPrivate + dedans vérifier si id existe déjà
        */
        return (this.chatGateway.createPublic(chat, id, {idUser: user.userID, username: user.username}));
    }

    @Post('valid-paswd')
    async passwordIsValid(@Body() psw: PswChat): Promise<boolean> {
       // console.log("psw: " + psw);
        //const channel: undefined | Chat = this.chatGateway.getChannelById(psw.id)
        const channel: undefined | DbChat = await this.chatGateway.getChannelByTest(psw.id);
        // console.log("ch: " + channel);
        if (typeof channel == "undefined" || channel === null || channel.password == '')
            return (false);
        const comp = await bcrypt.compare(psw.psw, channel.password);
       // console.log("valid-psw COMP: " + comp);
        return (comp);
    }
    //
    //@Guard() IL FAUT UN AUTHGUARD
    /* Remplacer id et username par un actuel user */
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

        console.log(channel);
        //console.log(await this.chatGateway.getListMsgByChannelId(id));
        //const channel = this.chatGateway.getChannelById(id);

        if (typeof channel === "undefined")
            return ({});
        //const getUser = channel.lstUsr.get(user.userID);
        console.log("owner: " + channel.owner);
        console.log("userID: " + user.userID);
        const getUser = await this.chatGateway.getUserOnChannel(id, user.userID);
        console.log(getUser);
        if (typeof getUser === "undefined" || getUser === null)
            return ({});
        console.log("userid ok");
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
            //lstUsr: Object.fromEntries(channel.lstUsr),
            /*,
            lstMute: Object.fromEntries(channel.lstMute),
            lstBan: Object.fromEntries(channel.lstBan),*/
        };
        return (convertChannel);
    }
}
