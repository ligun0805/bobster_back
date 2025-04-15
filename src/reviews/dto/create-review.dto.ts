import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsInt, IsString, Min, Max } from 'class-validator';
import { ReviewType } from '../infrastructure/review.entity';

export class CreateReviewDto {
  @ApiProperty({
    example: '4f2a1c85-ccce-4d77-8ac0-f533d179d36c',
    type: String,
  })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 2, type: Number })
  @IsNumber()
  traderId: number;

  @ApiProperty({ example: 3, type: Number })
  @IsNumber()
  customerId: number;

  @ApiProperty({ example: ReviewType.Fast, enum: ReviewType })
  @IsEnum(ReviewType)
  type: ReviewType;

  @ApiProperty({ example: 5, type: Number })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @ApiProperty({
    example: 'Yaha, best trader I have ever met before!',
    type: String,
  })
  @IsString()
  content: string;
}
