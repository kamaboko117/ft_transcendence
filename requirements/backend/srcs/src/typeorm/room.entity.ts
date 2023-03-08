import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn("uuid")
  uid: string;

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