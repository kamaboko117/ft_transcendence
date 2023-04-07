import { Channel } from './chat.entity';
import { User } from '../typeorm/user.entity';
export declare class ListMsg {
    id: number;
    content: string;
    user: User;
    user_id: number;
    chat: Channel;
    chatid: string;
}
