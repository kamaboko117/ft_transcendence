import { Channel } from './chat.entity';
import { User } from '../typeorm/user.entity';
export declare class ListBan {
    id: number;
    time: Date;
    user: User;
    user_id: number;
    chat: Channel;
    chatid: string;
}