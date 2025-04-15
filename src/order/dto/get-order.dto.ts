import { IsNumber, IsString, IsDate, IsOptional } from 'class-validator';

export class GetOrderDto {
  @IsString()
  orderId: string;

  @IsNumber()
  customerId?: number;

  @IsNumber()
  traderId?: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  usdtAmount: number;

  @IsNumber()
  paymentMethod: number;

  @IsString()
  status: string; // e.g., 'pending', 'processing', 'payment_pending', 'payment_received', 'final_payment_made', 'completed', 'expired', 'final_payment_expired'

  @IsOptional()
  @IsDate()
  timer?: Date; // Time limit for the customer to confirm payment

  @IsOptional()
  @IsDate()
  finalPaymentTimer?: Date; // Time limit for Trader1 to make the final payment

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
