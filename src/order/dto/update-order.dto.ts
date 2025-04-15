import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  traderId?: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  paymentMethodId?: number; // ID of the PaymentMethodEntity

  @IsOptional()
  @IsString()
  status?: string; // e.g., 'pending', 'processing', 'payment_pending', 'payment_received', 'final_payment_made', 'completed', 'expired', 'final_payment_expired'
}
