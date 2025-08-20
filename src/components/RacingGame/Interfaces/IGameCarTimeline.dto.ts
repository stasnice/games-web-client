import type ERoadTypes from 'components/RacingGame/enums/RoadTyprs.enum';

interface IGameCarTimelineDto {
  roadType: ERoadTypes;
  length: number;
  duration: number;
}

export default IGameCarTimelineDto;
