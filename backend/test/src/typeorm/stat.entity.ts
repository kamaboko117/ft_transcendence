import { PrimaryGeneratedColumn, Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Stat {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	victoire: number;

	@Column()
	défaite: number;

	@Column()
	nbGames: number;

	@Column()
	level: number;

	@Column()
	rank: number;

	@OneToOne(() => User, (user) => user.sstat, { nullable: false, cascade: true })
	@JoinColumn({name: 'userID'})
	user: User;
	@Column({nullable: false})
	userID: string

}
