import type IGameCarTimelineDto from 'components/RacingGame/Interfaces/IGameCarTimeline.dto';

interface IGameCarRenderDataDto {
  carId: number;

  timeline: IGameCarTimelineDto[];
}

export default IGameCarRenderDataDto;
