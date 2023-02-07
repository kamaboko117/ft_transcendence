import { Entity, Column, PrimaryGeneratedColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { ListMsg } from './lstmsg.entity';
import { ListUser } from './lstuser.entity';
import { ListMute } from './lstmute.entity';
import { ListBan } from './lstban.entity';

@Entity()
export class Channel {
    //@PrimaryGeneratedColumn()
    //num: number;
    @PrimaryColumn()
    id: string;
    @Column({ nullable: false })
    name: string;
    @Column({ nullable: false })
    owner: string;
    @Column({ nullable: false })
    accesstype: string;
    @Column({ nullable: true })
    password: string;
    @OneToMany(() => ListMsg, (listmsg) => listmsg.chat)
    lstMsg: ListMsg[];
    @OneToMany(() => ListUser, (listuser) => listuser.chat)
    lstUsr: ListUser[];
    @OneToMany(() => ListMute, (listmute) => listmute.chat)
    lstMute: ListUser[];
    @OneToMany(() => ListBan, (listban) => listban.chat)
    lstBan: ListUser[];
}