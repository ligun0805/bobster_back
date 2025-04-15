import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class Currency {
  @Allow()
  @ApiProperty({
    type: Number,
    example: 1,
  })
  id: number;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'USD',
  })
  symbol: string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'United State Dollar',
  })
  code: string;

  @Allow()
  @ApiProperty({
    type: Number,
    example: 100000,
  })
  limit: number;
}
