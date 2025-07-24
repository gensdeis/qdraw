import { IUserRepository } from '../../domain/user/user.repository';
import { User, UserStatus } from '../../domain/user/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

export class UserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string): Promise<User> {
    const exists = await this.userRepository.findByUsername(username);
    if (exists) throw new Error('Username already exists.');
    const hash = await bcrypt.hash(password, 10);
    const user = new User(uuidv4(), username, hash);
    return this.userRepository.create(user);
  }

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new Error('User not found.');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Password does not match.');
    const token = this.jwtService.sign({ sub: user.id, username: user.username });
    return { user, token };
  }

  async getProfile(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async updateStatus(id: string, status: UserStatus): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    user.status = status;
    return this.userRepository.update(user);
  }

  async addReward(id: string, amount: number): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    user.reward += amount;
    return this.userRepository.update(user);
  }

  async incrementWin(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    user.winCount += 1;
    user.winStreak += 1;
    if (user.winStreak > user.maxWinStreak) {
      user.maxWinStreak = user.winStreak;
    }
    return this.userRepository.update(user);
  }

  async incrementLose(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    user.loseCount += 1;
    user.winStreak = 0;
    return this.userRepository.update(user);
  }

  async getWinStreak(id: string): Promise<number> {
    // winCount를 연승으로 간주 (실제 연승 로직이 필요하면 별도 구현)
    const user = await this.userRepository.findById(id);
    if (!user) return 0;
    return user.winCount;
  }

  async incrementWinStreak(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    user.winStreak += 1;
    return this.userRepository.update(user);
  }

  async resetWinStreak(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    user.winStreak = 0;
    return this.userRepository.update(user);
  }

  async getRewardRanking(): Promise<{ id: string; username: string; reward: number; winStreak: number; }[]> {
    const users = await this.userRepository.list();
    // reward 내림차순, 동률이면 reward가 더 먼저 달성된(더 오래된) 사람이 위
    return users
      .sort((a, b) => {
        if (b.reward !== a.reward) return b.reward - a.reward;
        // reward 동률이면 reward 달성 시점을 lastHeartbeat로 가정
        return a.lastHeartbeat.getTime() - b.lastHeartbeat.getTime();
      })
      .map(u => ({ id: u.id, username: u.username, reward: u.reward, winStreak: u.winStreak }));
  }

  async getWinStreakRanking(): Promise<{ id: string; username: string; reward: number; winStreak: number; maxWinStreak: number; }[]> {
    const users = await this.userRepository.list();
    // maxWinStreak 내림차순, 동률이면 달성 시점을 lastHeartbeat로 가정
    return users
      .sort((a, b) => {
        if (b.maxWinStreak !== a.maxWinStreak) return b.maxWinStreak - a.maxWinStreak;
        return a.lastHeartbeat.getTime() - b.lastHeartbeat.getTime();
      })
      .map(u => ({ id: u.id, username: u.username, reward: u.reward, winStreak: u.winStreak, maxWinStreak: u.maxWinStreak }));
  }
} 