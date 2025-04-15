import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeSchedulesService } from './feeSchedules.service';
import { FeeScheduleEntity } from './infrastructure/feeSchedules.entity';
import { UserEntity } from '../../users/infrastructure/entities/user.entity';
import { FeeSchedulesController } from './feeSchedules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FeeScheduleEntity, UserEntity])],
  controllers: [FeeSchedulesController],
  providers: [FeeSchedulesService],
})
export class FeeScheduleModule {}
