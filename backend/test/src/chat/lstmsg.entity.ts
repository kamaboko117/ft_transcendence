import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './chat.entity';

@Entity()
export class ListMsg {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ nullable: false })
    idUser: string;
    @Column({ nullable: false })
    username: string;
    @Column({ nullable: true })
    content: string;
    @ManyToOne(() => Channel, (chat) => chat.lstMsg, { nullable: false })
    @JoinColumn({ name: 'chatid' })
    chat: Channel;
    @Column({ nullable: false })
    chatid: string
}