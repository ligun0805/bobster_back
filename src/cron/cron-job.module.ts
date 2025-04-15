import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronJobService } from './cron-job.service';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { FeeScheduleEntity } from '../base/feeSchedule/infrastructure/feeSchedules.entity';
import { OrdersModule } from '../order/orders.module';
import { TransactionEntity } from '../transactions/infrastructure/transaction.entity';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      UserEntity,
      FeeScheduleEntity,
      TransactionEntity,
    ]),
    OrdersModule,
  ],
  providers: [CronJobService],
})
export class CronJobModule {}
