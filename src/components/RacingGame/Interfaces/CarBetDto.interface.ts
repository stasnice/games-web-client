import type ICarDto from 'components/RacingGame/Interfaces/CarDto.interface';

interface ICarBetDto {
  id: string;
  car: ICarDto;
  dynamicOdds: number;
  dynamicWinRate: number;
  totalBetAmount: number;
}

export default ICarBetDto;
