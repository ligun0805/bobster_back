import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsJSON,
  IsNumber,
} from 'class-validator';
import { PaymentMethodType } from './method-type.enum';

export class UpdatePaymentMethodDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    example: PaymentMethodType.CreditCard,
    enum: PaymentMethodType,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiProperty({
    example:
      '{"Number": "1234-5678-9012-3456", "Name": "Alvin", "SurName": "Rufus", "Tag": "mybank"}',

    description: 'JSON string containing payment method-specific details',
  })
  @IsOptional()
  @IsJSON()
  details?: string;
}
