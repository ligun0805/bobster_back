import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { FeeScheduleEntity } from '../../../base/feeSchedule/infrastructure/feeSchedules.entity';
import { RoleEnum } from '../../../roles/roles.enum';

@Injectable()
export class FeeSchedulesSeedService {
  constructor(
    @InjectRepository(FeeScheduleEntity)
    private repository: Repository<FeeScheduleEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      await this.repository.save(
        this.repository.create({
          userId: 0,
          userType: RoleEnum.trader,
          fee: 3,
        }),
      );
      await this.repository.save(
        this.repository.create({
          userId: 0,
          userType: RoleEnum.referer,
          fee: 0.2,
        }),
      );
    }
  }
}
