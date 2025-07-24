import { UserUseCase } from './user.usecase';
import { IUserRepository } from '../../domain/user/user.repository';
import { User, UserStatus } from '../../domain/user/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

describe('UserUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let userUseCase: UserUseCase;
  let jwtService: JwtService;
  const mockUser = new User('1', 'test', 'hashedpw');

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    };
    jwtService = new JwtService({ secret: 'testsecret' });
    userUseCase = new UserUseCase(userRepository, jwtService);
  });

  it('register: successful user registration', async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.create.mockImplementation(async (user) => user);
    const user = await userUseCase.register('newuser', 'pw123');
    expect(user.username).toBe('newuser');
    expect(await bcrypt.compare('pw123', user.password)).toBe(true);
  });

  it('register: duplicate username error', async () => {
    userRepository.findByUsername.mockResolvedValue(mockUser);
    await expect(userUseCase.register('test', 'pw')).rejects.toThrow('Username already exists.');
  });

  it('login: successful login and JWT token return', async () => {
    const hash = await bcrypt.hash('pw123', 10);
    const user = new User('2', 'loginuser', hash);
    userRepository.findByUsername.mockResolvedValue(user);
    const result = await userUseCase.login('loginuser', 'pw123');
    expect(result.user.username).toBe('loginuser');
    const decoded = jwtService.verify(result.token, { secret: 'testsecret' });
    expect(decoded.sub).toBe('2');
    expect(decoded.username).toBe('loginuser');
  });

  it('login: user not found error', async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    await expect(userUseCase.login('nouser', 'pw')).rejects.toThrow('User not found.');
  });

  it('login: password mismatch error', async () => {
    const hash = await bcrypt.hash('pw123', 10);
    const user = new User('3', 'failuser', hash);
    userRepository.findByUsername.mockResolvedValue(user);
    await expect(userUseCase.login('failuser', 'wrongpw')).rejects.toThrow('Password does not match.');
  });

  it('getProfile: returns user data', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    const result = await userUseCase.getProfile('1');
    expect(result).toBe(mockUser);
    expect(userRepository.findById).toBeCalledWith('1');
  });

  it('updateStatus: updates user status', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    userRepository.update.mockResolvedValue({ ...mockUser, status: UserStatus.MATCHING });
    const result = await userUseCase.updateStatus('1', UserStatus.MATCHING);
    expect(result?.status).toBe(UserStatus.MATCHING);
    expect(userRepository.update).toBeCalled();
  });

  it('updateStatus: returns null if user not exists', async () => {
    userRepository.findById.mockResolvedValue(null);
    const result = await userUseCase.updateStatus('2', UserStatus.IDLE);
    expect(result).toBeNull();
  });
}); 