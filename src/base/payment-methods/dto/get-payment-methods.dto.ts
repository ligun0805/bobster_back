import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetPaymentMethodDtos {
  @ApiProperty({ example: 2, type: Number })
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
