// src/base/currencyPairs/dto/get-exchange-rate.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetExchangeRateDto {
  @ApiProperty({ example: 1, description: 'ID of the base currency' })
  @IsNotEmpty()
  @IsNumber()
  baseCurrencyId: number;

  @ApiProperty({ example: 2, description: 'ID of the target currency' })
  @IsNotEmpty()
  @IsNumber()
  targetCurrencyId: number;
}
