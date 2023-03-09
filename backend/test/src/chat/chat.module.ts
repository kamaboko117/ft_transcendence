import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { RoleService } from './role.service';
import { ChatController } from './chat.controller';
import { Channel } from './chat.entity';
import { ListMsg } from './lstmsg.entity';
import { ListUser } from './lstuser.entity';
import { ListMute } from './lstmute.entity';
import { ListBan } from './lstban.entity';
import { UsersModule } from 'src/users/users.module';
import { RoleController } from './role.controller';

@Module({
    providers: [ChatGateway, RoleService],
    imports: [TypeOrmModule.forFeature([Channel, ListMsg,
        ListUser, ListMute, ListBan]), UsersModule],
    exports: [ChatGateway],
    controllers: [ChatController, RoleController]
})
export class ChatModule { }
