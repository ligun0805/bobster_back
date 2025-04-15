// src/order/dto/query-order.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OrderStatusEnum } from '../order.enum';
import { plainToInstance, Transform, Type } from 'class-transformer';

export class FilterOrderDto {
  @ApiPropertyOptional({ enum: OrderStatusEnum, isArray: true })
  @IsOptional()
  @IsEnum(OrderStatusEnum, { each: true })
  statuses?: OrderStatusEnum[];

  @ApiPropertyOptional({ type: Number, isArray: true })
  @IsOptional()
  @IsArray()
  orderTypes?: number[];

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  isCash?: boolean;
}

export class SortOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsString()
  order: 'ASC' | 'DESC' | undefined;
}

export class QueryOrderDto {
  @ApiPropertyOptional({ type: Number })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ type: Number })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: OrderStatusEnum, isArray: true })
  @IsOptional()
  statuses?: OrderStatusEnum[];

  @ApiPropertyOptional({ type: Number, isArray: true })
  @IsOptional()
  @IsArray()
  orderTypes?: number[];

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  isCash?: boolean;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortOrderDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortOrderDto)
  sort?: SortOrderDto[] | null;
}
