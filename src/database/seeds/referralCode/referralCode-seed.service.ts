import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferralCodeEntity } from '../../../referralcodes/infrastructure/referralcode.entity';

@Injectable()
export class ReferralCodeSeedService {
  constructor(
    @InjectRepository(ReferralCodeEntity)
    private repository: Repository<ReferralCodeEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      await this.repository.save([
        this.repository.create({
          refererId: 0,
          roleId: 1,
        }),
      ]);
    }
  }
}
