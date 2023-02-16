import { Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { Channel } from '../chat/chat.entity';
import { ListMsg } from '../chat/lstmsg.entity';
import { ListUser } from '../chat/lstuser.entity';
import { ListBan } from '../chat/lstban.entity';
import { ListMute } from '../chat/lstmute.entity';

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

  @OneToMany(() => Channel, (listchannel) => listchannel.user)
  lstChannel: Channel[];

  @OneToMany(() => ListMsg, (listMsg) => listMsg.user)
  lstMsg: User[];
  
  @OneToMany(() => ListUser, (listUsr) => listUsr.user)
  lstUsr: User[];
  
  @OneToMany(() => ListBan, (listBan) => listBan.user)
  lstBan: User[];
  
  @OneToMany(() => ListMute, (listMute) => listMute.user)
  lstMute: User[];
}