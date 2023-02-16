import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './chat.entity';
import { User } from '../typeorm/user.entity';

@Entity()
export class ListMsg {
    @PrimaryGeneratedColumn()
    id: number;
    //@Column({ nullable: false })
    //idUser: string;
    @Column({ nullable: false })
    username: string;
    @Column({ nullable: true })
    content: string;
    
    @ManyToOne(() => User, (user) => user.lstMsg, { nullable: false, cascade: true })
    @JoinColumn({ name: 'user_id' })
    user: User;
    @Column({ nullable: false })
    user_id: number;

    @ManyToOne(() => Channel, (chat) => chat.lstMsg, { nullable: false, cascade: true })
    @JoinColumn({ name: 'chatid' })
    chat: Channel;
    @Column({ nullable: false })
    chatid: string;
}