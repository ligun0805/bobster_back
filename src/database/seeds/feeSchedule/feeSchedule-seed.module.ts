import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeeScheduleEntity } from '../../../base/feeSchedule/infrastructure/feeSchedules.entity';
import { FeeSchedulesSeedService } from './feeSchedule-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeeScheduleEntity])],
  providers: [FeeSchedulesSeedService],
  exports: [FeeSchedulesSeedService],
})
export class FeeSchedulesSeedModule {}
