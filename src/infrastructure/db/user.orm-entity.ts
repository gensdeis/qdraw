import { Entity, PrimaryColumn, Column } from 'typeorm';
import { UserStatus } from '../../domain/user/user.entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  winCount: number;

  @Column({ default: 0 })
  loseCount: number;

  @Column({ default: 0 })
  reward: number;

  @Column({ default: 0 })
  winStreak: number;

  @Column({ default: 0 })
  maxWinStreak: number;

  @Column({ type: 'varchar', default: UserStatus.IDLE })
  status: UserStatus;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  lastHeartbeat: Date;
} 