// src/order/dto/query-order.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryNotificationDto {
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
}
