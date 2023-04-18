import { User } from './user.entity';
export declare class BlackFriendList {
    id: number;
    type_list: number;
    userOwner: User;
    owner_id: number;
    userFocus: User;
    focus_id: number;
}
