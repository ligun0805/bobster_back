import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetPaymentMethodDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  user_id: number;
}
