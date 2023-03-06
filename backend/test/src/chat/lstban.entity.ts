import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './chat.entity';
import { User } from '../typeorm/user.entity';

@Entity()
export class ListBan {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ nullable: false })
    keyuser: string;
    @Column({ nullable: true })
    time: number;

    @ManyToOne(() => User, (user) => user.lstBan, { nullable: false, cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
    @Column({ nullable: false })
    user_id: number;

    @ManyToOne(() => Channel, (chat) => chat.lstMsg, { nullable: false, cascade: true, onDelete: 'CASCADE' })
    chat: Channel[];
}