import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateFeeScheduleDto } from './dto/create-feeSchedule.dto';
import { FeeSchedulesService } from './feeSchedules.service';

@ApiTags('Trader Fee & Referer Fee')
@Controller({
  path: 'fees',
  version: '1',
})
export class FeeSchedulesController {
  constructor(private readonly feesService: FeeSchedulesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createFeeDto: CreateFeeScheduleDto) {
    return this.feesService.create(createFeeDto);
  }

  @Get('/getDefaultRefererFee')
  @HttpCode(HttpStatus.OK)
  async getDefaultRefererFee() {
    return this.feesService.getDefaultRefererFee();
  }

  @Get('/getDefaultTraderFee')
  @HttpCode(HttpStatus.OK)
  async getDefaultTraderFee() {
    return this.feesService.getDefaultTraderFee();
  }
}
