import { DataSource } from 'typeorm';
import { Channel } from '../chat.entity';
import { ListUser } from '../lstuser.entity';
import { RoleGateway } from './role.gateway';
export declare class RoleService {
    private dataSource;
    private roleGateway;
    private chatsRepository;
    private listUserRepository;
    private listBanRepository;
    private listMuteRepository;
    constructor(dataSource: DataSource, roleGateway: RoleGateway);
    getOwner(id: Readonly<string>): Promise<Channel | null>;
    getRole(id: Readonly<string>, userId: Readonly<number>): Promise<ListUser | null>;
    getUser(id: Readonly<string>, userId: Readonly<number>): Promise<ListUser | null>;
    kickUser(id: Readonly<string>, user_id: Readonly<number>): Promise<void>;
    muteUser(id: Readonly<string>, user_id: Readonly<number>, time: Readonly<number>): Promise<void>;
    banUser(id: Readonly<string>, user_id: Readonly<number>, time: Readonly<number>): Promise<void>;
    unBanUser(id: Readonly<string>, userId: Readonly<number>): Promise<void>;
    unMuteUser(id: Readonly<string>, userId: Readonly<number>): Promise<void>;
    grantAdminUserWithTransact(id: Readonly<string>, userId: Readonly<number>, newRole: string): Promise<void>;
    setPsw(id: Readonly<string>, psw: Readonly<string>): Promise<void>;
    unSetPsw(id: Readonly<string>): Promise<void>;
}
