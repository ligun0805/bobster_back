import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationEntity } from './infrastructure/notification.entity';
import { AppGatewayModule } from '../chat/gateway.module';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity]), AppGatewayModule],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
