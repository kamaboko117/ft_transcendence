import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './chat.entity';
import { User } from '../typeorm/user.entity';

@Entity()
export class ListUser {
    @PrimaryGeneratedColumn()
    id: number;
    //@Column({ nullable: false })
    //iduser: string;

    @ManyToOne(() => User, (user) => user.lstUsr, { nullable: false, cascade: true })
    @JoinColumn({ name: 'user_id' })
    user: User;
    @Column({ nullable: false })
    user_id: number;

    @ManyToOne(() => Channel, (chat) => chat.lstUsr, { nullable: false, cascade: true })
    @JoinColumn({ name: 'chatid' })
    chat: Channel;
    @Column({ nullable: false })
    chatid: string
}