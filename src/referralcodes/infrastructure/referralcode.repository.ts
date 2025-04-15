import { NullableType } from '../../utils/types/nullable.type';
import { ReferralCode } from '../domain/referralcode';

export abstract class ReferralCodeRepository {
  abstract createReferer(data: Omit<ReferralCode, 'id'>): Promise<ReferralCode>;

  abstract createReferralCode(data: ReferralCode): Promise<void>;

  abstract findOneByRole(
    id: ReferralCode['refererId'],
    role: ReferralCode['roleId'],
  ): Promise<NullableType<ReferralCode>>;

  abstract findById(
    id: ReferralCode['id'],
  ): Promise<NullableType<ReferralCode>>;
  abstract findByCode(
    code: ReferralCode['id'],
  ): Promise<NullableType<ReferralCode>>;
}
