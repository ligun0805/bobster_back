import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  customerCurrencyId: number;

  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  receiverCurrencyId: number;

  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiProperty({ example: 1098, type: Number })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 3, type: Number })
  @IsNotEmpty()
  @IsNumber()
  paymentMethodId: number; // ID of the PaymentMethodEntity

  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  orderType: number;
}
