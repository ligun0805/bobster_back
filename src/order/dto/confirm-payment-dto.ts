import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class OrderIdDto {
  @ApiProperty({
    example: '43252346537464325',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;
}

export class TransferFileDto {
  @ApiProperty({
    example: '43252346537464325',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;
}

export class PaidOrderIdDto {
  @ApiProperty({
    example: '43252346537464325',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    example: '/uploads/receipts/receipt.pdf',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  receiptFilePath?: string;
}
