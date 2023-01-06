import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_id',
  })
  id: number;

  //the ID provided by 42
  @Column({
    type: 'bigint',
    name: '42user_id',
    nullable: false,
    default: 0,
  })
  userID: number;

  @Column({
    nullable: false,
    default: '',
  })
  username: string;

  // @Column({
  //   name: 'email_address',
  //   nullable: false,
  //   default: '',
  // })
  // email: string;

  // @Column({
  //   nullable: false,
  //   default: '',
  // })
  // password: string;
}