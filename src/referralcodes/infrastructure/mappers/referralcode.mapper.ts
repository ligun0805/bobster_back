import { ReferralCodeEntity } from '../referralcode.entity';
import { ReferralCode } from '../../domain/referralcode';

export class ReferralCodeMapper {
  static toDomain(raw: ReferralCodeEntity): ReferralCode {
    const domainEntity = new ReferralCode();
    domainEntity.id = raw.id;
    domainEntity.id = raw.id;
    domainEntity.refererId = raw.refererId;
    domainEntity.roleId = raw.roleId;
    return domainEntity;
  }

  static toPersistence(domainEntity: ReferralCode): ReferralCodeEntity {
    const persistenceEntity = new ReferralCodeEntity();
    persistenceEntity.id = domainEntity.id;
    persistenceEntity.id = domainEntity.id;
    persistenceEntity.refererId = domainEntity.refererId;
    persistenceEntity.roleId = domainEntity.roleId;
    return persistenceEntity;
  }
}
