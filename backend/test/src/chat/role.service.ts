import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './chat.entity';

@Injectable()
export class RoleService {
        @InjectRepository(Channel)
        private chatsRepository: Repository<Channel>;

        /* id == idChannel */
        async getOwner(id: Readonly<string>): Promise<Channel | null> {
                const channel: Promise<Channel | null> = this.chatsRepository.createQueryBuilder("channel")
                .where("channel.id = :id")
                .setParameters({id: id})
                .getOne();
                return (channel)
        }
}