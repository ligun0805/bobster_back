import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { GetPaymentMethodDto } from './dto/get-payment-method.dto';
import { RemovePaymentMethodDto } from './dto/remove-payment-method.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetPaymentMethodDtos } from './dto/get-payment-methods.dto';

@ApiTags('Payment-method')
@Controller({
  path: 'payment-methods',
  version: '1',
})
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Request() request,
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.create(
      createPaymentMethodDto,
      request.user.id,
    );
  }

  @Patch()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Request() request,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(
      updatePaymentMethodDto,
      request.user.id,
    );
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Request() request) {
    const getPaymentMethodDtos = new GetPaymentMethodDtos();
    getPaymentMethodDtos.id = request.user.id;
    return this.paymentMethodsService.findAll(getPaymentMethodDtos);
  }

  @Get(':id/:user_id')
  async findOne(@Param('id') id: number, @Param('user_id') user_id: number) {
    const getPaymentMethodDto = new GetPaymentMethodDto();
    getPaymentMethodDto.id = id;
    getPaymentMethodDto.user_id = user_id;
    return this.paymentMethodsService.findOne(getPaymentMethodDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async remove(@Request() request, @Param('id') id: number) {
    const removePaymentMethodDto = new RemovePaymentMethodDto();
    removePaymentMethodDto.id = id;
    return this.paymentMethodsService.remove(
      removePaymentMethodDto,
      request.user.id,
    );
  }
}
