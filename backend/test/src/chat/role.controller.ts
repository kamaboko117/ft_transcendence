import { Controller, Get, Query, Request } from '@nestjs/common';
import { Channel } from './chat.entity';
import { TokenUser } from './chat.interface';
import { ListUser } from './lstuser.entity';
import { RoleService } from './role.service';

type typeGetRole = {
        role: string,
        userId: number | undefined
}

@Controller('chat-role')
export class RoleController {
    constructor(private roleService: RoleService) {}

    async getRole(userId: Readonly<number>, channelId: Readonly<string>): Promise<typeGetRole> {
        //is owner from channel?
        if (!channelId || !userId)
            return ({role: "", userId: undefined});
        const channel: Channel | null = await this.roleService.getOwner(channelId);
        if (channel && channel.user_id === userId)
            return ({role: "Owner", userId: userId})
        const list_user: ListUser | null = await this.roleService.getRole(channelId, userId);
        if (!list_user)
            return ({role: "", userId: undefined});
        return ({role: list_user.role, userId: list_user.user_id});
        //otherwise call role from list_user
    }

    /* id = channel's id */
    @Get('getRole')
    async getQueryRole(@Request() req: Readonly<any>,
        @Query('id') id: Readonly<string>): Promise<typeGetRole> {
        const user: TokenUser = req.user;
        const role: typeGetRole = await this.getRole(user.userID, id);

        return (role);
    }
}