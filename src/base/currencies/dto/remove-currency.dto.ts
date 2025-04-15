import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class RemoveCurrencyDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNumber()
  id: number;
}
