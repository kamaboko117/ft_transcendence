import { CreateChatDto, Owner } from './dto/create-chat.dto';
import { InformationChat, DbChat } from './chat.interface';
import { Channel } from './chat.entity';
import { ListMute } from './lstmute.entity';
import { ListUser } from './lstuser.entity';
type Channel_ret = {
    Channel_id: string;
};
declare class Room {
    id: string;
    psw: string;
}
export declare class ChatService {
    private chatsRepository;
    private listUserRepository;
    private listMsgRepository;
    private listBanRepository;
    private listMuteRepository;
    private readonly blFrRepository;
    getAllPublic(): Promise<any[]>;
    getAllPrivate(userID: Readonly<number>): Promise<any[]>;
    getAllPmUser(userID: Readonly<number>): Promise<ListUser[]>;
    findDuplicateAndDelete(user_id: Readonly<string>): Promise<void>;
    findPmUsers(userOne: Readonly<number>, userTwo: Readonly<string>): Promise<Channel_ret | undefined>;
    createPrivateMessage(userOne: Readonly<number>, userTwo: Readonly<string>): Promise<string>;
    getAllUserOnChannels(userID: Readonly<number>): Promise<Channel[]>;
    getListMsgByChannelId(id: string, userId: number): Promise<{
        user_id: number;
        content: string;
    }[]>;
    getChannelByTest(id: string): Promise<undefined | DbChat>;
    getChannelByName(name: string): Promise<undefined | DbChat>;
    getUserMuted(id: string, user_id: number): Promise<ListMute | null>;
    getUserOnChannel(id: string, user_id: number): Promise<any>;
    getAllUsersOnChannel(id: string, userId: number): Promise<any>;
    createChat(chat: CreateChatDto, id: string, owner: Owner): InformationChat;
    setNewUserChannel(channel: Readonly<any>, user_id: Readonly<number>, data: Readonly<Room>): Promise<undefined | boolean>;
}
export {};
