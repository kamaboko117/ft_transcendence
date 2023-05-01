import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Room {
  @PrimaryGeneratedColumn("uuid")
  uid: string;

  @Column({
    nullable: false,
    default: "",
  })
  roomName: string;

  @Column({ default: false })
  private!: boolean;

  @Column({ default: false })
  player_one_rdy!: boolean;
  @Column({ default: false })
  player_two_rdy!: boolean;

  @Column({ nullable: false, default: "Classic" })
  player_one_type_game: string;

  @Column({ nullable: false, default: "Classic" })
  player_two_type_game: string;

  @Column({ nullable: true, default: null })
  settings: object;
}
