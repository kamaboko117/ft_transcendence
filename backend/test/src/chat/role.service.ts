import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './chat.entity';
import { ListUser } from './lstuser.entity';

@Injectable()
export class RoleService {
        @InjectRepository(Channel)
        private chatsRepository: Repository<Channel>;
        @InjectRepository(ListUser)
        private listUserRepository: Repository<ListUser>;

        /* id == idChannel */
        getOwner(id: Readonly<string>): Promise<Channel | null> {
                const channel: Promise<Channel | null> = this.chatsRepository.createQueryBuilder("channel")
                .where("channel.id = :id")
                .setParameters({id: id})
                .getOne();
                return (channel)
        }

        getRole(id: Readonly<string>, userId: Readonly<number>): Promise<ListUser | null> {
                const list_user: Promise<ListUser | null> = this.listUserRepository.createQueryBuilder("list_user")
                .where("list_user.chatid = :id")
                .andWhere("list_user.user_id = :userId")
                .setParameters({id: id, userId: userId})
                .getOne()
                return (list_user);
        }
}