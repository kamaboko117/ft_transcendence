import { Channel } from '../chat/chat.entity';
import { BlackFriendList } from './blackFriendList.entity';
import { Stat } from './stat.entity';
import { MatchHistory } from './matchHistory.entity';
export declare class User {
    userID: number;
    username: string;
    avatarPath: string;
    token: string;
    fa: boolean;
    secret_fa: string;
    fa_first_entry: boolean;
    fa_psw: string;
    lstChannel: Channel[];
    lstMsg: User[];
    lstUsr: User[];
    lstBan: User[];
    lstMute: User[];
    lstBlackFriendOwner: BlackFriendList[];
    lstBlackFriendFocus: BlackFriendList[];
    sstat: Stat[];
    matchPlayerOne: MatchHistory[];
    matchPlayerTwo: MatchHistory[];
    userVictory: MatchHistory[];
}
