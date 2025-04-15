// src/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentEntity } from './infrastructure/payment.entity';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { CurrencyEntity } from '../base/currencies/infrastructure/currency.entity';
import { AppGatewayModule } from '../chat/gateway.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity, UserEntity, CurrencyEntity]),
    AppGatewayModule,
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        middlewares: [session()],
        token: process.env.TELEGRAM_CUSTOMER_TOKEN || 'default_token',
      }),
      botName: 'customerBot', // Unique name for the first bot
    }),
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
