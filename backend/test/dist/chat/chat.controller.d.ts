import { ChatGateway } from './chat.gateway';
import { InformationChat } from './chat.interface';
import { CreateChatDto } from './dto/create-chat.dto';
import { PswChat } from './psw-chat.dto';
import { Channel } from './chat.entity';
import { ListUser } from './lstuser.entity';
import { UsersService } from '../users/providers/users/users.service';
import { ChatService } from './chat.service';
export declare class ChatController {
    private chatGateway;
    private chatService;
    private userService;
    constructor(chatGateway: ChatGateway, chatService: ChatService, userService: UsersService);
    getAllPublic(req: any): Promise<InformationChat[]>;
    getAllPrivate(req: any, id: Readonly<string>): Promise<InformationChat[]>;
    getAllUsersOnChannel(req: any, id: Readonly<string>): Promise<any>;
    getDirectMessage(req: any): Promise<ListUser[]>;
    getAllChanUser(req: any): Promise<Channel[]>;
    findPm(user_id: number, id: string): Promise<string>;
    openPrivateMessageByUsername(req: any, username: Readonly<string>): Promise<{
        valid: boolean;
        channel_id: string;
        listPm: {
            chatid: string;
            user: {
                username: string;
            };
        };
    }>;
    openPrivateMessage(req: any, id: Readonly<string>): Promise<string | null>;
    getHasPaswd(req: any, id: Readonly<string>): Promise<boolean>;
    postNewPublicChat(req: any, chat: CreateChatDto): Promise<InformationChat | string[]>;
    postNewPrivateChat(req: any, chat: CreateChatDto): Promise<InformationChat | string[]>;
    passwordIsValid(psw: PswChat): Promise<boolean>;
    getChannel(req: any, id: Readonly<string>): Promise<{
        id: string | undefined;
        name: string | undefined;
        owner: number | undefined;
        accesstype: string | undefined;
        lstMsg: {
            user_id: number;
            content: string;
        }[];
        authorized: boolean;
    } | {
        ban?: undefined;
    } | {
        ban: boolean;
    }>;
}
