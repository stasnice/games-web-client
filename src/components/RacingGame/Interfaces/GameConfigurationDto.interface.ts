import type IBetsConfiguration from 'components/RacingGame/Interfaces/IBetsConfiguration.interface';
import type { StatesDuration } from 'components/RacingGame/racing-game';

export default interface IGameConfigurationDto {
  durations: StatesDuration;

  bets: IBetsConfiguration;
}
