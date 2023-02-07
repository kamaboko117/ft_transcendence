import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'room_id',
  })
  id: number;

  @Column({
    nullable: false,
    default: '',
  })
  roomName: string;

  @Column({
    type: 'bigint',
    default: 1,
  })
  Capacity: number;
}