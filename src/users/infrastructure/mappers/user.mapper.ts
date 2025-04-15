import { CurrencyEntity } from '../../../base/currencies/infrastructure/currency.entity';
import { LanguageEntity } from '../../../base/languages/infrastructure/language.entity';
import { FileEntity } from '../../../files/infrastructure/persistence/relational/entities/file.entity';
import { FileMapper } from '../../../files/infrastructure/persistence/relational/mappers/file.mapper';
import { ReferralCodeEntity } from '../../../referralcodes/infrastructure/referralcode.entity';
import { RoleEntity } from '../../../roles/infrastructure/role.entity';
import { StatusEntity } from '../../../statuses/infrastructure/status.entity';
import { User } from '../../domain/user';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  //from Repository To Entity
  static toDomain(raw: UserEntity): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.userName = raw.userName;
    domainEntity.tgId = raw.tgId;
    domainEntity.referralAmount = raw.referralAmount;
    if (raw.photo) {
      domainEntity.photo = FileMapper.toDomain(raw.photo);
    }
    domainEntity.role = raw.role;
    domainEntity.tradeType = raw.tradeType;
    domainEntity.fee = raw.fee;
    domainEntity.currentBalance = raw.currentBalance;
    domainEntity.processingBalance = raw.processingBalance;
    domainEntity.status = raw.status;
    domainEntity.myCurrency = raw.myCurrency;
    domainEntity.referralCode = raw.referralCode;
    domainEntity.language = raw.language;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    domainEntity.isVerified = raw.isVerified;
    domainEntity.wallet = raw.wallet;
    domainEntity.tgUserName = raw.tgUserName;

    return domainEntity;
  }

  static toPersistence(domainEntity: User): UserEntity {
    let role: RoleEntity | undefined = undefined;

    if (domainEntity.role) {
      role = new RoleEntity();
      role.id = Number(domainEntity.role.id);
    }

    let referralCode: ReferralCodeEntity | undefined = undefined;

    if (domainEntity.referralCode) {
      referralCode = new ReferralCodeEntity();
      referralCode.id = String(domainEntity.referralCode.id);
      referralCode.refererId = Number(domainEntity.referralCode.refererId);
      referralCode.roleId = Number(domainEntity.referralCode.roleId);
    } else if (domainEntity.referralCode === null) {
      // referralCode = null;
    }

    let photo: FileEntity | undefined | null = undefined;

    if (domainEntity.photo) {
      photo = new FileEntity();
      photo.id = domainEntity.photo.id;
      photo.path = domainEntity.photo.path;
    } else if (domainEntity.photo === null) {
      photo = null;
    }

    let status: StatusEntity | undefined = undefined;

    if (domainEntity.status) {
      status = new StatusEntity();
      status.id = Number(domainEntity.status.id);
    }

    let myCurrency: CurrencyEntity | undefined = undefined;

    if (domainEntity.myCurrency) {
      myCurrency = new CurrencyEntity();
      myCurrency.id = domainEntity.myCurrency.id;
      myCurrency.code = domainEntity.myCurrency.code;
      myCurrency.symbol = domainEntity.myCurrency.symbol;
    }

    let receiverCurrency: CurrencyEntity | undefined = undefined;

    if (domainEntity.receiverCurrency) {
      receiverCurrency = new CurrencyEntity();
      receiverCurrency.id = domainEntity.receiverCurrency.id;
      receiverCurrency.code = domainEntity.receiverCurrency.code;
      receiverCurrency.symbol = domainEntity.receiverCurrency.symbol;
    }

    let language: LanguageEntity | undefined = undefined;

    if (domainEntity.language) {
      language = new LanguageEntity();
      language.id = domainEntity.language.id;
      language.code = domainEntity.language.code;
      language.name = domainEntity.language.name;
    }

    const persistenceEntity = new UserEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.userName = domainEntity.userName;
    persistenceEntity.tgId = domainEntity.tgId;
    persistenceEntity.referralAmount = domainEntity.referralAmount;
    persistenceEntity.photo = photo;
    persistenceEntity.referralCode = referralCode;
    persistenceEntity.role = role;
    persistenceEntity.tradeType = domainEntity.tradeType;
    persistenceEntity.fee = domainEntity.fee;
    persistenceEntity.currentBalance = domainEntity.currentBalance;
    persistenceEntity.processingBalance = domainEntity.processingBalance;
    persistenceEntity.status = status;
    persistenceEntity.myCurrency = myCurrency;
    persistenceEntity.receiverCurrency = receiverCurrency;
    persistenceEntity.language = language;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;
    persistenceEntity.isVerified = domainEntity.isVerified;
    persistenceEntity.wallet = persistenceEntity.wallet;
    persistenceEntity.tgUserName = domainEntity.tgUserName;

    return persistenceEntity;
  }
}
