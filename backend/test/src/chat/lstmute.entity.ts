import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './chat.entity';

@Entity()
export class ListMute {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ nullable: false })
    keyuser: string;
    @Column({ nullable: true })
    time: number;
    @ManyToOne(() => Channel, (chat) => chat.lstMsg, { nullable: false })
    chat: Channel[];
}