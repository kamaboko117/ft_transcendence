import { Controller, Get, Query, Request } from '@nestjs/common';
import { Channel } from './chat.entity';
import { TokenUser } from './chat.interface';
import { RoleService } from './role.service';

@Controller('chat-role')
export class RoleController {
    constructor(private roleService: RoleService) {}
    async getRole(userId: Readonly<number>, channelId: Readonly<string>) {
        //is owner from channel?
        const channel: Channel | null = await this.roleService.getOwner(channelId)
        
        console.log("typeof userID");
        console.log(typeof userId);
        console.log("typeof channel.user_id");
        console.log(channel?.user_id);
        if (channel && channel.user_id === userId)
            return ("Owner")
        //otherwise call role from list_user
    }

    /* id = channel's id */
    @Get('getRole')
    getQueryRole(@Request() req: Readonly<any>,
        @Query('id') id: Readonly<string>) {
        const user: TokenUser = req.user;
        const isUserOwner = this.getRole(user.userID, id);
    }
}