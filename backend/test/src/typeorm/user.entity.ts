import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  /* Possibilite de se servir de userID (42) comme cle primaire */
  /*@PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
  })
  id: number;
*/
  //the ID provided by 42
  @PrimaryColumn({
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
  @Column({ nullable: true })
  avatarPath: string;
  /* Refresh token */
  @Column({
    nullable: false,
    default: '',
  })
  token: string;
}