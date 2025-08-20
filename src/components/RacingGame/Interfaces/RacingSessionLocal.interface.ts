import type EInternalGameNames from 'components/RacingGame/enums/InternalGameNames.enum';
import type ERacingGameStates from 'components/RacingGame/enums/RacingGameStates.enum';
import type { ResponseRoad } from 'components/RacingGame/racing-game';
import type ICarBetDto from 'components/RacingGame/Interfaces/CarBetDto.interface';
import type IGameConfigurationDto from 'components/RacingGame/Interfaces/GameConfigurationDto.interface';
import type IRewardData from 'components/RacingGame/Interfaces/RewardData.interface';
import type IPlayerBetLocal from 'components/RacingGame/Interfaces/PlayerBetLocal.interface';
import type IGameResultDto from 'components/RacingGame/Interfaces/GameResultDto.interface';

interface IRacingSessionLocal {
  sessionId: string;
  gameId: number;
  gameName: EInternalGameNames;
  state: ERacingGameStates;
  timeLeft: number;
  road: ResponseRoad[];
  carBets: ICarBetDto[];
  myBets: IPlayerBetLocal[] | [];
  totalBetsAmount: number;
  totalBetsCount: number;
  result: IGameResultDto;
  configuration: IGameConfigurationDto;
  membersCount: number;
  rewardData: IRewardData[] | null;
}

export default IRacingSessionLocal;
