import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { ReferralCodesRegisterLoginDto } from './dto/referralcodes-register-login.dto';
import { ReferralCodeRepository } from './infrastructure/referralcode.repository';
import { ReferralCode } from './domain/referralcode';
import { NullableType } from '../utils/types/nullable.type';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { User } from '../users/domain/user';
import { UserRepository } from '../users/infrastructure/user.repository';

@Injectable()
export class ReferralCodeService {
  constructor(
    @Inject(forwardRef(() => UserRepository))
    private readonly usersRepository: UserRepository,
    private readonly referralCodeRepository: ReferralCodeRepository,
  ) {}

  findByCode(code: ReferralCode['id']): Promise<NullableType<ReferralCode>> {
    return this.referralCodeRepository.findByCode(code);
  }

  createReferer(): Promise<ReferralCode> {
    const referCode = new ReferralCode();
    referCode.refererId = 0;
    referCode.roleId = RoleEnum.referer;
    return this.referralCodeRepository.createReferer(referCode);
  }

  createTrader2(): Promise<ReferralCode> {
    const referCode = new ReferralCode();
    referCode.refererId = 0;
    referCode.roleId = RoleEnum.trader2;
    return this.referralCodeRepository.createReferer(referCode);
  }
  createReferralCode(referralcode: ReferralCode): Promise<void> {
    return this.referralCodeRepository.createReferralCode(referralcode);
  }

  getReferralCode(
    userId: number,
    role: number,
  ): Promise<NullableType<ReferralCode>> {
    return this.referralCodeRepository.findOneByRole(userId, role);
  }

  async register(
    dto: ReferralCodesRegisterLoginDto,
    refererId: number,
  ): Promise<void> {
    await this.create({
      ...dto,
      status: {
        id: StatusEnum.active,
      },
      tradeType: 1,
      currentBalance: 0,
      processingBalance: 0,
      wallet: '',
    });

    await this.incrementReferralAmount(refererId);
  }

  async create(createProfileDto: CreateUserDto): Promise<User> {
    const clonedPayload = {
      ...createProfileDto,
    };

    if (clonedPayload.role?.id) {
      const roleObject = Object.values(RoleEnum)
        .map(String)
        .includes(String(clonedPayload.role.id));
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'roleNotExists',
          },
        });
      }
    }

    if (clonedPayload.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(clonedPayload.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }
    }
    if (clonedPayload.referralCode?.id) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(clonedPayload.referralCode?.id)) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'referralcode syntax must be uuid',
          },
        });
      }
    }

    const newUser = await this.usersRepository.create(clonedPayload);

    if (newUser.role?.id == RoleEnum.trader2) {
      const referCode = new ReferralCode();
      referCode.refererId = newUser.id;
      referCode.roleId = RoleEnum.trader2;
      await this.createReferralCode(referCode);
    }

    return newUser;
  }

  async incrementReferralAmount(id: User['id']): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (user) await this.usersRepository.increaseReferralAmount(user.id);
  }
}
