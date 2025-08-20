interface ICarDto {
  id: number;

  name: string;

  iconFront: string;

  iconSide: string;

  iconTop: string;

  iconFrontThumb: string;

  standartOdds: number;

  standartWinRate: number;

  capabilities: Record<string, number>;
}

export default ICarDto;
