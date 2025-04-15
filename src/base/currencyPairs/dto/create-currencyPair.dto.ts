import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCurrencyPairDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  baseCurrencyId: number;

  @ApiProperty({ example: 2, type: Number })
  @IsNotEmpty()
  @IsNumber()
  targetCurrencyId: number;

  @ApiProperty({ example: 3.6, type: Number })
  @IsNotEmpty()
  @IsNumber()
  exchangeRate: number;

  @ApiProperty({ example: 10, type: Number })
  @IsNotEmpty()
  @IsNumber()
  profit: number;
}
