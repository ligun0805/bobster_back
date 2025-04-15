import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReferralCodeEntity } from '../referralcode.entity';
import { Repository } from 'typeorm';
import { ReferralCodeRepository } from '../referralcode.repository';

import { ReferralCodeMapper } from '../mappers/referralcode.mapper';
import { ReferralCode } from '../../domain/referralcode';
import { NullableType } from '../../../utils/types/nullable.type';

@Injectable()
export class ReferralCodeRelationalRepository
  implements ReferralCodeRepository
{
  constructor(
    @InjectRepository(ReferralCodeEntity)
    private readonly referralCodeRepository: Repository<ReferralCodeEntity>,
  ) {}

  async createReferer(data: ReferralCode): Promise<ReferralCode> {
    const persistenceModel = ReferralCodeMapper.toPersistence(data);
    return this.referralCodeRepository.save(
      this.referralCodeRepository.create(persistenceModel),
    );
  }

  async createReferralCode(data: ReferralCode): Promise<void> {
    const persistenceModel = ReferralCodeMapper.toPersistence(data);
    await this.referralCodeRepository.save(
      this.referralCodeRepository.create(persistenceModel),
    );
  }

  async findById(id: ReferralCode['id']): Promise<NullableType<ReferralCode>> {
    const entity = await this.referralCodeRepository.findOne({
      where: {
        id: id,
      },
    });
    return entity ? ReferralCodeMapper.toDomain(entity) : null;
  }

  async findByCode(
    code: ReferralCode['id'],
  ): Promise<NullableType<ReferralCode>> {
    const entity = await this.referralCodeRepository.findOne({
      where: {
        id: code,
      },
    });
    return entity ? ReferralCodeMapper.toDomain(entity) : null;
  }
  async findOneByRole(
    code: ReferralCode['refererId'],
    role: ReferralCode['roleId'],
  ): Promise<NullableType<ReferralCode>> {
    const entity = await this.referralCodeRepository.findOne({
      where: {
        refererId: code,
        roleId: role,
      },
    });
    return entity ? ReferralCodeMapper.toDomain(entity) : null;
  }
}
