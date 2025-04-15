// src/order/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrderController } from './orders.controller';
import { OrderEntity } from './infrastructure/order.entity';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { CurrencyEntity } from '../base/currencies/infrastructure/currency.entity';
import { PaymentMethodEntity } from '../base/payment-methods/infrastructure/payment-method.entity';
import { AppGatewayModule } from '../chat/gateway.module';
import { CurrencyPairEntity } from '../base/currencyPairs/infrastructure/currencyPairs.entity';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      UserEntity,
      CurrencyEntity,
      PaymentMethodEntity,
      CurrencyPairEntity,
    ]),
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        middlewares: [session()],
        token: process.env.TELEGRAM_TRADER1_TOKEN || 'default_token',
      }),
      botName: 'trader1Bot', // Unique name for the third bot
    }),
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        middlewares: [session()],
        token: process.env.TELEGRAM_CUSTOMER_TOKEN || 'default_token',
      }),
      botName: 'customerBot', // Unique name for the first bot
    }),
    AppGatewayModule,
  ],
  providers: [OrdersService],
  controllers: [OrderController],
  exports: [OrdersService],
})
export class OrdersModule {}
