import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './chat.entity';

@Entity()
export class ListUser {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ nullable: false })
    iduser: string;
    @Column({ nullable: true })
    username: string;
    @ManyToOne(() => Channel, (chat) => chat.lstUsr, { nullable: false, cascade: true })
    @JoinColumn({ name: 'chatid' })
    chat: Channel;
    @Column({ nullable: false })
    chatid: string
}