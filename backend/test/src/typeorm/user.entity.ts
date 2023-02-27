import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { BlackFriendList } from './blackFriendList.entity';
import { Stat } from './stat.entity';

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
  //OneToMany vers blackfriendList
  @OneToMany(() => BlackFriendList, (blackfriendlist) => blackfriendlist.owner_id)
  lstBlackFriendOwner: BlackFriendList[];
  @OneToMany(() => BlackFriendList, (blackfriendlist) => blackfriendlist.userFocus)
  lstBlackFriendFocus: BlackFriendList[];
  @OneToOne(() => Stat, (stat) => stat.user)
  sstat: Stat[]
}