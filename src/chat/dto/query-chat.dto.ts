// src/order/dto/query-order.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryChatDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  isFinished?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isChat?: boolean;
}
