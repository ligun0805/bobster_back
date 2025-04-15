import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class ReferralCode {
  @Allow()
  @ApiProperty({
    type: String,
    example: '278a4156-bc82-4e5f-ba52-c62450261e73',
  })
  id: string;

  @Allow()
  @ApiProperty({
    type: Number,
    example: '23',
  })
  refererId: number;

  @Allow()
  @ApiProperty({
    type: Number,
    example: 'active',
  })
  roleId: number;
}
