import { MatchUseCase } from './match.usecase';
import { IMatchRepository } from '../../domain/match/match.repository';
import { Match, MatchStatus } from '../../domain/match/match.entity';

describe('MatchUseCase', () => {
  let matchRepository: jest.Mocked<IMatchRepository>;
  let matchUseCase: MatchUseCase;
  const match1 = new Match('1', 'user1');

  beforeEach(() => {
    matchRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findWaiting: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    };
    matchUseCase = new MatchUseCase(matchRepository);
  });

  it('requestMatch: ��� �� ��Ī�� ������ ���� ����', async () => {
    matchRepository.findWaiting.mockResolvedValue(null);
    matchRepository.create.mockImplementation(async (m) => m);
    const result = await matchUseCase.requestMatch('user1');
    expect(result.user1Id).toBe('user1');
    expect(matchRepository.create).toBeCalled();
  });

  it('requestMatch: ��� �� ��Ī�� ������ ����', async () => {
    const waiting = new Match('2', 'user2');
    matchRepository.findWaiting.mockResolvedValue(waiting);
    matchRepository.update.mockImplementation(async (m) => m);
    const result = await matchUseCase.requestMatch('user3');
    expect(result.user2Id).toBe('user3');
    expect(result.status).toBe(MatchStatus.READY);
    expect(matchRepository.update).toBeCalled();
  });

  it('cancelMatch: ���� ��� ��Ī�� ������ ����', async () => {
    const waiting = new Match('3', 'user4');
    matchRepository.findWaiting.mockResolvedValue(waiting);
    await matchUseCase.cancelMatch('user4');
    expect(matchRepository.delete).toBeCalledWith('3');
  });

  it('cancelMatch: ���� ��� ��Ī�� ������ �ƹ��͵� ����', async () => {
    matchRepository.findWaiting.mockResolvedValue(null);
    await matchUseCase.cancelMatch('user5');
    expect(matchRepository.delete).not.toBeCalled();
  });

  it('getMatch: ��Ī ��ȸ', async () => {
    matchRepository.findById.mockResolvedValue(match1);
    const result = await matchUseCase.getMatch('1');
    expect(result).toBe(match1);
  });
}); 