import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class PaymentIdDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  paymentId: number;
}
