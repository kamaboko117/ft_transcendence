import { User } from './user.entity';
export declare class MatchHistory {
    id: number;
    type_game: string;
    MP1: User;
    player_one: number;
    MP2: User;
    player_two: number;
    victory_user: User;
    user_victory: number;
}
