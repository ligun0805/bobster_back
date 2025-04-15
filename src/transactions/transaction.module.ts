// src/order/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppGatewayModule } from '../chat/gateway.module';
import { TransactionEntity } from './infrastructure/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity]), AppGatewayModule],
})
export class TransactionModule {}
