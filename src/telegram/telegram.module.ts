import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule } from '@nestjs/config';
import { session } from 'telegraf';

import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { UsersModule } from '../users/users.module';

import { ReferralCodesModule } from '../referralcodes/referralcodes.module';
import { AuthModule } from '../auth/auth.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeScheduleEntity } from '../base/feeSchedule/infrastructure/feeSchedules.entity';
import { BlockTgUserIdModule } from '../base/blockTgUserId/blockTgUserIds.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeeScheduleEntity]),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        middlewares: [session()],
        token: process.env.TELEGRAM_CUSTOMER_TOKEN || 'default_token',
      }),
      botName: 'customerBot', // Unique name for the first bot
    }),
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        middlewares: [session()],
        token: process.env.TELEGRAM_REFERRER_TOKEN || 'default_token',
      }),
      botName: 'referrerBot', // Unique name for the second bot
    }),
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
        token: process.env.TELEGRAM_TRADER2_TOKEN || 'default_token',
      }),
      botName: 'trader2Bot', // Unique name for the fourth bot
    }),
    AuthModule,
    UsersModule,
    ReferralCodesModule,
    BlockTgUserIdModule,
  ],
  controllers: [],
  providers: [TelegramService, TelegramController],
})
export class TelegramModule {}
