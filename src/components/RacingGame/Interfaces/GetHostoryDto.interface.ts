import type ICarDto from 'components/RacingGame/Interfaces/CarDto.interface';

interface IGetHistoryDto {
  sessionId: string;

  sessionTime: Date;

  result: ICarDto;

  winnersCount: number;

  prizes: number;
}

export default IGetHistoryDto;
