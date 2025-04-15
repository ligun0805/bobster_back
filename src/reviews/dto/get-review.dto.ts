// src/review/dto/get-review.dto.ts
import { IsUUID, IsEnum, IsInt, IsString } from 'class-validator';
import { ReviewType } from '../infrastructure/review.entity';

export class GetReviewDto {
  @IsUUID()
  id: string;

  @IsUUID()
  orderId: string;

  @IsUUID()
  traderId: string;

  @IsUUID()
  customerId: string;

  @IsEnum(ReviewType)
  type: ReviewType;

  @IsInt()
  score: number;

  @IsString()
  content: string;
}
