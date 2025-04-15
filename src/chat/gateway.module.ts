import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppGateway } from './chats.gateway';
import { ChatModule } from './chats.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationEntity } from '../notify/infrastructure/notification.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    ChatModule,
    AuthModule,
    UsersModule,
  ],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class AppGatewayModule {}
