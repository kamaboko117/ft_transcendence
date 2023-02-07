import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { Channel } from './chat.entity';
import { ListMsg } from './lstmsg.entity';
import { ListUser } from './lstuser.entity';
import { ListMute } from './lstmute.entity';
import { ListBan } from './lstban.entity';

@Module({
    providers: [ChatGateway,],
    imports: [TypeOrmModule.forFeature([Channel, ListMsg,
        ListUser, ListMute, ListBan])],
    exports: [ChatGateway],
    controllers: [ChatController]
})
export class ChatModule { }
