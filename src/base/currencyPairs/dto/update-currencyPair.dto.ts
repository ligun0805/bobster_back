import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCurrencyPairDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ example: 1.35, type: Number })
  @IsNotEmpty()
  @IsNumber()
  exchangeRate: number;

  @ApiProperty({ example: 10, type: Number })
  @IsNotEmpty()
  @IsNumber()
  profit: number;
}
