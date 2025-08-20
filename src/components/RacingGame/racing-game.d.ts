import type ERoadTypes from 'components/RacingGame/enums/RoadTyprs.enum';

export type RoadPart = {
  position: number;
  name: ERoadTypes;
  lengthInPercentage: number;
  isVisible: boolean;
};

export type ResponseRoad = {
  roadType: ERoadTypes;
  length: number;
};

export type StatesDuration = {
  BET?: number;

  RESULT?: number;

  PROCESSING_BETS?: number;

  GAME_IN_PROGRESS?: number;

  START_IN_PROGRESS?: number;
};
