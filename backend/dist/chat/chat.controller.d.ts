import { InformationChat } from './chat.interface';
import { CreateChatDto } from './dto/create-chat.dto';
import { PswChat } from './psw-chat.dto';
import { Channel } from './chat.entity';
import { ListUser } from './lstuser.entity';
import { UsersService } from '../users/providers/users/users.service';
import { ChatService } from './chat.service';
export declare class ChatController {
    private chatService;
    private userService;
    constructor(chatService: ChatService, userService: UsersService);
    getAllPublic(): Promise<InformationChat[]>;
    getAllPrivate(req: any): Promise<InformationChat[]>;
    getAllUsersOnChannel(req: any, id: string): Promise<any>;
    getDirectMessage(req: any): Promise<ListUser[]>;
    getAllChanUser(req: any): Promise<Channel[]>;
    findPm(user_id: number, id: string): Promise<string>;
    openPrivateMessageByUsername(req: any, username: string): Promise<{
        valid: boolean;
        channel_id: string;
        listPm: {
            chatid: string;
            user: {
                username: string;
            };
        };
    }>;
    openPrivateMessage(req: any, id: string): Promise<{
        asw: string | null | undefined;
    }>;
    getHasPaswd(req: any, id: string): Promise<boolean>;
    postNewPublicChat(req: any, chat: CreateChatDto): Promise<InformationChat | string[]>;
    postNewPrivateChat(req: any, chat: CreateChatDto): Promise<InformationChat | string[]>;
    passwordIsValid(psw: PswChat): Promise<boolean>;
    getChannel(req: any, id: string): Promise<{
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
