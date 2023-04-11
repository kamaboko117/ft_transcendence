import { Channel } from './chat.entity';
import { User } from '../typeorm/user.entity';
export declare class ListUser {
    id: number;
    role: string;
    user: User;
    user_id: number;
    chat: Channel;
    chatid: string;
}
