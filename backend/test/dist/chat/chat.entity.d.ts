import { User } from '../typeorm/user.entity';
import { ListMsg } from './lstmsg.entity';
import { ListUser } from './lstuser.entity';
export declare class Channel {
    id: string;
    name: string;
    accesstype: string;
    password: string;
    user: User;
    user_id: number;
    lstMsg: ListMsg[];
    lstUsr: ListUser[];
    lstMute: ListUser[];
    lstBan: ListUser[];
}
