import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrencyPairsService } from './currencyPairs.service';
import { CreateCurrencyPairDto } from './dto/create-currencyPair.dto';
import { UpdateCurrencyPairDto } from './dto/update-currencyPair.dto';
import { RemoveCurrencyPairDto } from './dto/remove-currencyPair.dto';
import { GetExchangeRateDto } from './dto/get-exchange-rate.dto';

@ApiTags('Currency Pair')
@Controller({
  path: 'currency-pairs',
  version: '1',
})
@UsePipes(new ValidationPipe({ transform: true }))
export class CurrencyPairsController {
  constructor(private readonly currencyPairsService: CurrencyPairsService) {}

  @Post()
  async create(@Body() createCurrencyPairDto: CreateCurrencyPairDto) {
    return this.currencyPairsService.create(createCurrencyPairDto);
  }

  @Patch()
  async update(@Body() updateCurrencyPairDto: UpdateCurrencyPairDto) {
    return this.currencyPairsService.update(updateCurrencyPairDto);
  }

  @Get()
  async findAll() {
    return this.currencyPairsService.findAll();
  }

  @Get('exchange-rate/:id1/:id2')
  async getExchangeRate(
    @Param('id1') baseCurrencyId: number,
    @Param('id2') targetCurrencyId: number,
  ) {
    const getExchangeRateDto = new GetExchangeRateDto();
    getExchangeRateDto.baseCurrencyId = baseCurrencyId;
    getExchangeRateDto.targetCurrencyId = targetCurrencyId;
    return this.currencyPairsService.getExchangeRate(getExchangeRateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const removeCurrencyPairDto = new RemoveCurrencyPairDto();
    removeCurrencyPairDto.id = id;
    return this.currencyPairsService.delete(removeCurrencyPairDto);
  }
}
