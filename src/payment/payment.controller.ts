import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreateDepositDto, CreateWithdrawDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { PaymentIdDto } from './dto/confirm-payment.dto';
import { PaymentEntity } from './infrastructure/payment.entity';
import { Address, beginCell, TonClient } from '@ton/ton';

const client = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/jsonRPC',
  apiKey: process.env.TON_RPC_KEY,
});

@ApiTags('Payment')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('deposit')
  async deposit(@Body() depositDto: CreateDepositDto) {
    return this.paymentService.deposit(depositDto);
  }

  @Get('findDepositData')
  async findDepositData(@Query() query: QueryPaymentDto) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const keyword = query?.keyword ?? '';

    return this.paymentService.findDepositData({
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
        keyword,
      },
    });
  }

  @Patch('confirmDeposit')
  async confirmDeposit(@Body() paymentIdDto: PaymentIdDto) {
    return this.paymentService.confirmDeposit(paymentIdDto);
  }

  @Patch('rejectDeposit')
  async rejectDeposit(@Body() paymentIdDto: PaymentIdDto) {
    return this.paymentService.rejectDeposit(paymentIdDto);
  }

  @Post('withdraw')
  async withdraw(@Body() withdrawDto: CreateWithdrawDto) {
    return this.paymentService.withdraw(withdrawDto);
  }

  @Get('findWithDrawData')
  async findWithDrawData(@Query() query: QueryPaymentDto) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const keyword = query?.keyword ?? '';

    return this.paymentService.findWithDrawData({
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
        keyword,
      },
    });
  }

  @Patch('confirmWithdraw')
  async confirmWithdraw(@Body() paymentIdDto: PaymentIdDto) {
    return this.paymentService.confirmWithdraw(paymentIdDto);
  }

  @Patch('rejectWithdraw')
  async rejectWithdraw(@Body() paymentIdDto: PaymentIdDto) {
    return this.paymentService.rejectWithdraw(paymentIdDto);
  }

  @Get('findById/:paymentId')
  async findById(
    @Param('paymentId') paymentId: string,
  ): Promise<PaymentEntity> {
    console.log('Received paymentId:', paymentId);

    return this.paymentService.findById(paymentId);
  }

  @Get('getJettonTokenAddress')
  async getJettonTokenAddress(
    @Query('tokenAddress') tokenAddress: string,
    @Query('address') address: string,
  ) {
    const walletAddress = (
      await client.runMethod(
        Address.parse(tokenAddress),
        'get_wallet_address',
        [
          {
            type: 'slice',
            cell: beginCell().storeAddress(Address.parse(address)).endCell(),
          },
        ],
      )
    ).stack.readAddress();

    return walletAddress.toString({
      urlSafe: true,
      bounceable: false,
    });
  }

  @Get('getJettonTokenBalance')
  async getJettonTokenBalance(
    @Query('tokenAddress') tokenAddress: string,
    @Query('address') address: string,
  ) {
    const walletAddress = (
      await client.runMethod(
        Address.parse(tokenAddress),
        'get_wallet_address',
        [
          {
            type: 'slice',
            cell: beginCell().storeAddress(Address.parse(address)).endCell(),
          },
        ],
      )
    ).stack.readAddress();

    const getWalletDataResult = await client.runMethod(
      walletAddress,
      'get_wallet_data',
    );
    const balance = Number(getWalletDataResult.stack.readBigNumber()) / 1000000;

    return balance;
  }
}
