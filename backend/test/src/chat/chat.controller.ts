import { Controller, Request, Query, Get, Post, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { InformationChat, TokenUser, DbChat } from './chat.interface';
import { CreateChatDto } from './dto/create-chat.dto';
import { PswChat } from './psw-chat.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Channel } from './chat.entity';
import { ListUser } from './lstuser.entity';
import { UsersService } from '../users/services/users/users.service';
import { User } from 'src/typeorm';

type Channel_ret = {
    Channel_id: string
}

@Controller('chat')
export class ChatController {
    constructor(private chatGateway: ChatGateway,
        private userService: UsersService) { }
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
        const user: TokenUser = req.user;
        return (await this.chatGateway.getAllPrivate(user.userID));
    }

    @Get('users')
    async getAllUsersOnChannel(@Request() req: any,
        @Query('id') id: Readonly<string>) {
        const listUsers: any = await this.chatGateway.getAllUsersOnChannel(id);
        if (typeof listUsers === "undefined" || listUsers === null)
            return (false);
        return (listUsers);
    }

    /* Start of fixed chatbox part */
    @Get('list-pm')
    async getDirectMessage(@Request() req: any) {
        const user: TokenUser = req.user;
        const channel: ListUser[] | null
            = await this.chatGateway.getAllPmUser(user.userID);
        return (channel);
    }
    @Get('channel-registered')
    async getAllChanUser(@Request() req: any) {
        const user: TokenUser = req.user;
        const channel: Channel[] | null
            = await this.chatGateway.getAllUserOnChannels(user.userID);
        return (channel);
    }

    async findPm(user_id: number, id: string): Promise<string> {
        await this.chatGateway.findDuplicateAndDelete(String(user_id));
        await this.chatGateway.findDuplicateAndDelete(id);
        const list_user: Channel_ret | undefined
            = await this.chatGateway.findPmUsers(user_id, id);
        if (typeof list_user === "undefined") {
            const ret: string
                = await this.chatGateway.createPrivateMessage(user_id, id);
            return (ret);
        }
        return (list_user.Channel_id);
    }

    /* Find user PM by username */
    @Get('find-pm-username')
    async openPrivateMessageByUsername(@Request() req: any,
        @Query('username') username: Readonly<string>): Promise<{
            channel_id: string, listPm: {
                chatid: string,
                user: {
                    username: string
                },
            }
        } | null> {
        const tokenUser: TokenUser = req.user;

        if (username === "" || typeof username === "undefined")
            return (null);
        const user: User | null = await this.userService.findUserByName(username);
        if (!user || tokenUser.userID === Number(user.userID))
            return (null);
        console.log("user pm:")
        console.log(user);
        const channel_id = await this.findPm(tokenUser.userID, String(user.userID));
        return ({
            channel_id: channel_id,
            listPm: {
                chatid: channel_id, user: { username: user.username }
            }
        });
    }

    /*
        find PM from both user
        if it doesn't exist, create a pm
    */
    @Get('private-messages')
    async openPrivateMessage(@Request() req: any,
        @Query('id') id: Readonly<string>): Promise<string | null> {
        const user: TokenUser = req.user;

        if (user.userID === Number(id))
            return (null);
        const channel_id = await this.findPm(user.userID, id);
        return (channel_id);
    }
    /* End of fixed chatbox part */

    /*
        id = id channel
        name = channel's name
    */
    @UseGuards(JwtGuard)
    @Get('has-paswd')
    async getHasPaswd(@Request() req: any,
        @Query('id') id: Readonly<string>): Promise<boolean> {
        const user: TokenUser = req.user;
        const channel: undefined | DbChat = await this.chatGateway.getChannelByTest(id);
        if (typeof channel != "undefined" && channel != null) {
            const getUser = await this.chatGateway.getUserOnChannel(id, user.userID);
            if (typeof getUser !== "undefined" || getUser === null)
                return (false);
            //const getUser = channel.lstUsr.get(user.userID);
            // console.log(getUser);
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
        const user: TokenUser = req.user;
        const channel: undefined | DbChat = await this.chatGateway.getChannelByName(chat.name);
        let err: string[] = [];
        if ((chat.accesstype != '0' && chat.accesstype != '1'))
            err.push("Illegal access type");
        if (chat.name.length === 0)
            err.push("Chat name must not be empty.");
        else if (chat.name == chat.password)
            err.push("Password and chat name can't be the same.");
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
        console.log("getall")
        console.log(getAll);
        const findUser = await this.userService.findUsersById(user.userID);
        return (this.chatGateway.createChat(chat, len, { idUser: user.userID, username: findUser?.username }));
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
        const user: TokenUser = req.user;
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
        const findUser = await this.userService.findUsersById(user.userID);
        return (this.chatGateway.createChat(chat, id, { idUser: user.userID, username: findUser?.username }));
    }

    @Post('valid-paswd')
    async passwordIsValid(@Body() psw: PswChat): Promise<boolean> {
        const channel: undefined | DbChat = await this.chatGateway.getChannelByTest(psw.id);
        if (typeof channel == "undefined" || channel === null || channel.password == '')
            return (false);
        const comp = await bcrypt.compare(psw.psw, channel.password);
        return (comp);
    }

    @Get('')
    async getChannel(@Request() req: any,
        @Query('id') id: Readonly<string>) {
        const user: TokenUser = req.user;
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
        console.log(getUser);
        if (getUser === "Ban")
            return ({ ban: true });
        if (typeof getUser === "undefined" || getUser === null
            || getUser === "Ban")
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
