import { IsString, IsInt } from 'class-validator';

export interface Chat {
    id: number | string;
    name: string;
    owner: number;
    accessType: string;
    password: string;
    lstMsg: Array<{
        avatarUrl: string,
        id: number | string,
        username: string,
        content: string
    }>;
}
