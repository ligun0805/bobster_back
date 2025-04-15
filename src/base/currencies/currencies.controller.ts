import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { GetCurrencyDto } from './dto/get-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { RemoveCurrencyDto } from './dto/remove-currency.dto';

@ApiTags('Currency')
@Controller({
  path: 'currencies',
  version: '1',
})
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Post()
  async create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currenciesService.create(createCurrencyDto);
  }

  @Get()
  async findAll() {
    return this.currenciesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const getCurrencyDto = new GetCurrencyDto();
    getCurrencyDto.id = id;
    return this.currenciesService.findOne(getCurrencyDto);
  }

  @Patch()
  async update(@Body() updateCurrencyDto: UpdateCurrencyDto) {
    return this.currenciesService.update(updateCurrencyDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const removeCurrencyDto = new RemoveCurrencyDto();
    removeCurrencyDto.id = id;
    return this.currenciesService.remove(removeCurrencyDto);
  }
}
