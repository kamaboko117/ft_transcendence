export declare class Owner {
    idUser: number;
    username: string | undefined;
}
export declare class CreateChatDto {
    id: string;
    name: string;
    accesstype: string;
    password: string;
    lstMsg: Array<{
        user_id: number;
        username: string;
        content: string;
    }>;
    lstUsr: Map<number | string, string>;
    lstMute: Map<string, number>;
    lstBan: Map<string, number>;
}
