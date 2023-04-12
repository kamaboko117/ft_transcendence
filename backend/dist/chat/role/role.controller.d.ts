import { PostActionDto, PostActionDtoPsw } from '../dto/role-action-dto';
import { RoleService } from './role.service';
type typeGetRole = {
    role: string;
    userId: number | undefined;
};
export declare class RoleController {
    private roleService;
    constructor(roleService: RoleService);
    getRole(userId: Readonly<number>, channelId: Readonly<string>): Promise<typeGetRole>;
    getQueryRole(req: any, id: string): Promise<typeGetRole>;
    grantUser(idFromRequest: Readonly<number>, getRoleRequest: Readonly<typeGetRole>, userId: Readonly<number>, id: Readonly<string>, newRole: Readonly<string>): Promise<void>;
    banUser(id: Readonly<string>, userId: Readonly<number>, time: Readonly<number>, role: Readonly<string>): void;
    unBanUser(id: Readonly<string>, userId: Readonly<number>, role: Readonly<string>): void;
    unMuteUser(id: Readonly<string>, userId: Readonly<number>, role: Readonly<string>): void;
    muteUser(id: Readonly<string>, userId: Readonly<number>, time: Readonly<number>, role: Readonly<string>): void;
    kickUser(id: Readonly<string>, userId: Readonly<number>, role: Readonly<string>): void;
    setPsw(id: Readonly<string>, role: Readonly<string>, psw: Readonly<string>): void;
    unSetPsw(id: Readonly<string>, role: Readonly<string>): void;
    getAccessType(req: any, id: string): Promise<boolean>;
    runActionAdmin(req: any, body: PostActionDto): Promise<boolean>;
    runActionAdminSpecial(req: any, body: PostActionDto): Promise<boolean>;
    runActionAdminPsw(req: any, body: PostActionDtoPsw): Promise<boolean>;
}
export {};
