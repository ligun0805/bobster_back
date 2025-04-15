import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';

export class SortPaymentDto {
  @ApiPropertyOptional({ description: 'The field to sort by' })
  @IsOptional()
  @IsString()
  orderBy: string;

  @ApiPropertyOptional({
    description: 'Sorting order: ASC or DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order: 'ASC' | 'DESC';
}

export class QueryPaymentDto {
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

  @ApiPropertyOptional({
    type: String,
    description: 'Sorting options as a JSON string',
    example: '[{"orderBy": "createdAt", "order": "DESC"}]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      const parsedValue = JSON.parse(value);
      return Array.isArray(parsedValue)
        ? plainToInstance(SortPaymentDto, parsedValue)
        : [plainToInstance(SortPaymentDto, parsedValue)];
    } catch {
      return undefined;
    }
  })
  @ValidateNested({ each: true })
  @Type(() => SortPaymentDto)
  sort?: SortPaymentDto[];
}
