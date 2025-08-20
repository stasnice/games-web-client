import type IRacingSessionDto from 'components/RacingGame/Interfaces/RacingsessionDto.interface';
import type IWinnerDto from 'components/RacingGame/Interfaces/WinnerDto.interface';

interface ISessionDetailDto {
  session: IRacingSessionDto;

  leaderboard: IWinnerDto[];

  myWinner: IWinnerDto;

  winnersCount: number;

  tips: number;
}

export default ISessionDetailDto;
