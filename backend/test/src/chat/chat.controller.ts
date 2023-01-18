import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
/*import { ChatService } from './chat.service';*/
import { ChatGateway } from './chat.gateway';
import { Chat } from './chat.interface';
import { IsString, IsInt, IsArray } from 'class-validator';
import * as bcrypt from 'bcrypt';

class CreateChatDto {
    @IsInt()
    id: number;
    @IsString()
    name: string;
    @IsInt()
    owner: number;
    @IsString()
    accessType: string;
    @IsString()
    password: string;
    @IsArray()
    lstMsg: Array<{
        avatarUrl: string,
        id: number | string,
        username: string,
        content: string
    }>;
    @IsArray()
    lstUsr: Array<{
        avatarUrl: string,
        id: number | string,
        username: string,
        content: string
    }>;
}

class CreateChatDtoTwo {
    @IsString()
    id: string;
    @IsString()
    name: string;
    @IsInt()
    owner: number;
    @IsString()
    accessType: string;
    @IsString()
    password: string;
    @IsArray()
    lstMsg: Array<{
        id: number | string,
        username: string,
        content: string,
        avatarUrl: string,
    }>;
    @IsArray()
    lstUsr: Array<{
        id: number | string,
        username: string,
        content: string,
        avatarUrl: string,
    }>;
    lstMute: Array<{
        id: number | string,
        time: number //parse millisecondes depuis 1970
    }>
    lstBan: Array<{
        id: number | string,
        time: number //parse millisecondes depuis 1970
    }>
}

@Controller('chat')
export class ChatController {
    constructor(/*private chatService: ChatService,*/
        private chatGateway: ChatGateway) { }

    @Get('list')
    async getAll(): Promise<Chat[]> {
        return (this.chatGateway.getAllPublic());
    }
    @Post('new-public')
    async postNewPublicChat(@Body() chat: CreateChatDto): Promise<Chat[]> {
        const len: number = this.chatGateway.getAllPublic().length;

        if (chat.accessType != '0')
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (chat.password != '')
            chat.accessType = '1';
        console.log(chat);
        this.chatGateway.createPublic(chat, len);
        //create public room
        /*pas fou de retourner le psw, à changer*/
        return (this.chatGateway.getAllPublic());
    }
    @Post('new-private')
    async postNewPrivateChat(@Body() chat: CreateChatDtoTwo): Promise<Chat[]> {
        const str: string = await bcrypt.hash(chat.name, 10);

        if (chat.accessType != '1')
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (chat.password != '')
            chat.accessType = '1';
        this.chatGateway.createPrivate(chat, str)
        //create private room
        /*pas fou de retourner le psw, à changer*/
        return (this.chatGateway.getAllPrivate());
    }
}
