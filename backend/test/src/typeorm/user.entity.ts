import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  /* Possibilite de se servir de userID (42) comme cle primaire */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
  })
  id: number;

  //the ID provided by 42
  @Column({
    type: 'bigint',
    name: 'user_id',
    nullable: false,
    default: 0,
  })
  userID: number;

  @Column({
    nullable: false,
    default: '',
  })
  username: string;

  /* Refresh token */
  @Column({
    nullable: false,
    default: '',
  })
  token: string;
}