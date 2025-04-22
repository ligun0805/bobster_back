import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppGateway } from './chats.gateway';
import { ChatModule } from './chats.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationEntity } from '../notify/infrastructure/notification.entity';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, UserEntity]),
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
    ChatModule,
    AuthModule,
    UsersModule,
  ],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class AppGatewayModule {}
