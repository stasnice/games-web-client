import type ICarBetDto from 'components/RacingGame/Interfaces/CarBetDto.interface';
import type IGameCarRenderDataDto from 'components/RacingGame/Interfaces/GameCarRenderDataDto.interface';

interface IGameResultDto {
  winner: ICarBetDto;

  renderData: IGameCarRenderDataDto[];
}

export default IGameResultDto;
