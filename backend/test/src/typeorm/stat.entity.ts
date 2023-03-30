import { PrimaryGeneratedColumn, Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Stat {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	victory: number;

	@Column()
	defeat: number;

	@Column()
	nb_games: number;

	@Column()
	level: number;

	@Column()
	rank: number;

	@Column()
	experience: number;

	@Column()
	counter: number;

	@OneToOne(() => User, (user) => user.sstat, { nullable: false, cascade: true, onDelete: 'CASCADE' })
	@JoinColumn({name: 'user_id'})
	user: User;
	@Column({nullable: false})
	user_id: string

}
