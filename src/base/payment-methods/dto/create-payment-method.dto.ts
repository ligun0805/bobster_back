import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsJSON } from 'class-validator';
import { PaymentMethodType } from './method-type.enum';

export class CreatePaymentMethodDto {
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
  @IsNotEmpty()
  @IsJSON()
  details: string;
}
