import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class RemoveCurrencyPairDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNumber()
  id: number;
}
