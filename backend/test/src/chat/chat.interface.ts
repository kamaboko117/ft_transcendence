export interface InformationChat {
    channel_id: string,
    channel_name: string,
    //owner: number,
    User_username: string,
    channel_accesstype: string,
}

export interface DbChat {
    id: string,
    name: string,
    user_id: number,
    password: string,
    accesstype: string,
}

export interface Chat {
    id: string,
    name: string,
    owner: number,
    accesstype: string,
    password: string,
    lstMsg: Array<{
        user_id: number,
        username: string, //à enlever pour un find dans repository
        content: string
    }>,
    lstUsr: Map<number | string, string>,
    lstMute: Map<string, number>,
    lstBan: Map<string, number>,
}

export interface TokenUser {
    userID: number,
    token: string,
    username: string,
    fa: boolean
}