import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, Server } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './chat.entity';
import { ListUser } from './lstuser.entity';
import { RoleGateway } from './role.gateway';
import { ListBan } from './lstban.entity';
import { ListMute } from './lstmute.entity';


@Injectable()
export class RoleService {
        @InjectRepository(Channel)
        private chatsRepository: Repository<Channel>;
        @InjectRepository(ListUser)
        private listUserRepository: Repository<ListUser>;
        @InjectRepository(ListBan)
        private listBanRepository: Repository<ListBan>;
        @InjectRepository(ListMute)
        private listMuteRepository: Repository<ListMute>;

        constructor(private dataSource: DataSource, private roleGateway: RoleGateway) { }

        /* id == idChannel */
        getOwner(id: Readonly<string>): Promise<Channel | null> {
                const channel: Promise<Channel | null> = this.chatsRepository.createQueryBuilder("channel")
                        .where("channel.id = :id")
                        .setParameters({ id: id })
                        .getOne();
                return (channel)
        }

        getRole(id: Readonly<string>, userId: Readonly<number>): Promise<ListUser | null> {
                const list_user: Promise<ListUser | null> = this.listUserRepository.createQueryBuilder("list_user")
                        .where("list_user.chatid = :id")
                        .andWhere("list_user.user_id = :userId")
                        .setParameters({ id: id, userId: userId })
                        .getOne()
                return (list_user);
        }

        getUser(id: Readonly<string>, userId: Readonly<number>): Promise<ListUser | null> {
                return (
                        this.listUserRepository.createQueryBuilder("list_user")
                                .where("list_user.chatid = :id")
                                .andWhere("list_user.user_id = :userId")
                                .setParameters({ id: id, userId: userId })
                                .getOne()
                );
        }

        async banUser(id: Readonly<string>, user_id: Readonly<number>,
                time: Readonly<number>) {
                const runner = this.dataSource.createQueryRunner();

                await runner.connect();
                await runner.startTransaction();
                try {
                        const user: ListUser | null = await this.getUser(id, user_id);
                        if (!user) {
                                throw new NotFoundException("User not found, couldn't grant user.");
                        }
                        let date = new Date();
                        date.setSeconds(date.getSeconds() + time);
                        //ban user
                        await this.listBanRepository.createQueryBuilder()
                                .insert()
                                .into(ListBan)
                                .values({
                                        time: date,
                                        user_id: user_id,
                                        chatid: id
                                })
                                .execute();
                        //remove user from channel
                        await this.listUserRepository
                                .createQueryBuilder()
                                .delete()
                                .from(ListUser)
                                .where("chatid = :id")
                                .setParameters({ id: id })
                                .andWhere("user_id = :user_id")
                                .setParameters({ user_id: user_id })
                                .execute();
                        await runner.commitTransaction();
                        this.roleGateway.updateListChat(id);
                } catch (e) {
                        await runner.rollbackTransaction();
                } finally {
                        //doc want it released
                        await runner.release();
                }
        }
        /* run transaction
                find the future user granted
                grant the user
        */
        async grantAdminUserWithTransact(id: Readonly<string>, userId: Readonly<number>,
                newRole: string) {
                const runner = this.dataSource.createQueryRunner();

                await runner.connect();
                await runner.startTransaction();
                try {
                        const user: ListUser | null = await this.getUser(id, userId);
                        if (!user) {
                                throw new NotFoundException("User not found, couldn't grant user.");
                        }
                        await this.listUserRepository.createQueryBuilder().update(ListUser)
                                .set({ role: newRole })
                                .where("id = :id")
                                .setParameters({ id: user.id })
                                .execute();
                        await runner.commitTransaction();
                        this.roleGateway.updateListChat(id);
                } catch (e) {
                        await runner.rollbackTransaction();
                } finally {
                        //doc want it released
                        await runner.release();
                }
        }
}