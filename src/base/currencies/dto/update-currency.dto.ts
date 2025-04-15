import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateCurrencyDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'USD', type: String })
  @IsNotEmpty()
  @IsString()
  code?: string;

  @ApiProperty({ example: 'United States Dollar', type: String })
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiProperty({ example: '$', type: String })
  @IsString()
  @IsNotEmpty()
  symbol?: string;

  @ApiProperty({ example: 100000, type: Number })
  @IsNotEmpty()
  @IsNumber()
  limit?: number;
}
