import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { Channel } from '../chat.entity';
import { TokenUser } from '../chat.interface';
import { PostActionDto } from '../dto/role-action-dto';
import { ListUser } from '../lstuser.entity';
import { RoleService } from './role.service';

type typeGetRole = {
    role: string,
    userId: number | undefined
}

@Controller('chat-role')
export class RoleController {
    constructor(private roleService: RoleService) { }

    async getRole(userId: Readonly<number>, channelId: Readonly<string>): Promise<typeGetRole> {
        //is owner from channel?
        if (!channelId || !userId)
            return ({ role: "", userId: undefined });
        const channel: Channel | null = await this.roleService.getOwner(channelId);
        //mute because try multiple owner
        //if (channel && channel.user_id === userId)
        //    return ({role: "Owner", userId: userId})
        const list_user: ListUser | null = await this.roleService.getRole(channelId, userId);
        if (!list_user)
            return ({ role: "", userId: undefined });
        return ({ role: list_user.role, userId: list_user.user_id });
    }
    /* GET part */
    /* id = channel's id */
    @Get('getRole')
    async getQueryRole(@Request() req: Readonly<any>,
        @Query('id') id: string): Promise<typeGetRole> {
        console.log(id)
        const user: TokenUser = req.user;
        const role: typeGetRole = await this.getRole(user.userID, id);

        return (role);
    }
    /*  grant user to administrator */
    async grantUser(idFromRequest: number, getRoleRequest: typeGetRole,
        userId: Readonly<number>, id: Readonly<string>, newRole: string) {
        if (getRoleRequest.role === "Owner"
            && Number(getRoleRequest.userId) === idFromRequest) {
            await this.roleService.grantAdminUserWithTransact(id, userId, newRole);
        }
    }

    banUser(id: Readonly<string>, userId: number,
        time: number, role: Readonly<string>) {
        if (time < 0)
            return ;
        if (role === "Administrator" || role === "Owner")
            this.roleService.banUser(id, userId, time);
    }

    muteUser(id: Readonly<string>, userId: number,
        time: number, role: Readonly<string>) {
        if (time < 0)
            return ;
        if (role === "Administrator" || role === "Owner")
            this.roleService.muteUser(id, userId, time);
    }

    kickUser(id: Readonly<string>, userId: number,
        role: Readonly<string>) {
        if (role === "Administrator" || role === "Owner")
            this.roleService.kickUser(id, userId, );
    }

    /* POST */
    @Post('role-action')
    async runActionAdmin(@Request() req: any,
        @Body() body: PostActionDto): Promise<boolean> {
        const user: TokenUser = req.user;
        const action: string = body.action;
        const getRole = await this.getRole(user.userID, body.id);
        const getRoleUserFocus = await this.getRole(body.userId, body.id);
        
        if (!getRoleUserFocus || getRoleUserFocus.role === "Owner")
            return (false);
        if (!getRole || user.userID === body.userId
            || (getRole.role !== "Owner" && getRole.role !== "Administrator"))
            return (false);
        switch (action) {
            case "Grant":
                this.grantUser(user.userID, getRole,
                    body.userId, body.id, "Administrator");
                break;
            case "Remove":
                this.grantUser(user.userID, getRole,
                    body.userId, body.id, "");
                break;
            case "Ban":
                this.banUser(body.id, body.userId, Number(body.option), getRole.role);
                break;
            case "Mute":
                this.muteUser(body.id, body.userId, Number(body.option), getRole.role);
                break ;
            case "Kick":
                this.kickUser(body.id, body.userId, getRole.role);
                break;
            default:
                break;
        }
        return (true);
    }
}