import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { UserRepository } from './infrastructure/user.repository';
import { User } from './domain/user';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { UserEntity } from './infrastructure/entities/user.entity';
import { UserVerificationEntity } from './infrastructure/entities/user-verification.entity';
import { AuthEmailRegisterLoginDto } from '../auth/dto/auth-email-register.dto';
import { ReferralCodeService } from '../referralcodes/referralcodes.service';
import { ReferralCode } from '../referralcodes/domain/referralcode';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly referralCodeService: ReferralCodeService,
    @InjectRepository(UserVerificationEntity)
    private readonly verificationRepository: Repository<UserVerificationEntity>,
  ) {}

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
    if (newUser.role?.id == RoleEnum.referer) {
      const referCode = new ReferralCode();
      referCode.refererId = newUser.id;
      referCode.roleId = RoleEnum.customer;
      await this.referralCodeService.createReferralCode(referCode);
      referCode.roleId = RoleEnum.trader;
      await this.referralCodeService.createReferralCode(referCode);
      referCode.roleId = RoleEnum.trader2;
      await this.referralCodeService.createReferralCode(referCode);
    }

    return newUser;
  }

  async createAdmin(createAdminDto: AuthEmailRegisterLoginDto): Promise<void> {
    const clonedPayload = {
      ...createAdminDto,
    };
    await this.usersRepository.createAdmin(clonedPayload);
  }

  async verifyUser(
    userId: number,
    verifyUserDto: VerifyUserDto,
  ): Promise<UserEntity> {
    const user = await this.usersRepository.findById_Entity(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const verification = await this.verificationRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    if (verification.length > 0) {
      await this.verificationRepository.update(verification[0].id, {
        user: user,
        firstName: verifyUserDto.firstName,
        lastName: verifyUserDto.lastName,
        middleName: verifyUserDto.middleName || undefined,
        documentType: verifyUserDto.documentType,
        documentId: verifyUserDto.documentId,
      });
    } else {
      const newVerification = this.verificationRepository.create({
        user: user,
        firstName: verifyUserDto.firstName,
        lastName: verifyUserDto.lastName,
        middleName: verifyUserDto.middleName || undefined,
        documentType: verifyUserDto.documentType,
        documentId: verifyUserDto.documentId,
      });

      await this.verificationRepository.save(newVerification);
    }

    await this.usersRepository.update(userId, { isVerified: true });

    const updatedUser = await this.usersRepository.findById_Entity(userId);
    if (!updatedUser) {
      throw new NotFoundException('Failed to retrieve updated user');
    }

    return updatedUser;
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    return this.usersRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findByEmail(email: string): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: User['id']): Promise<NullableType<User>> {
    return this.usersRepository.findById(id);
  }

  findById_Entity(id: User['id']): Promise<NullableType<UserEntity>> {
    return this.usersRepository.findById_Entity(id);
  }

  findByTel_userId(tel_userId: User['tgId']): Promise<NullableType<User>> {
    return this.usersRepository.findByTel_userId(tel_userId);
  }

  findByTel_userName(
    tel_userName: User['tgUserName'],
  ): Promise<NullableType<User>> {
    return this.usersRepository.findByTel_userName(tel_userName);
  }

  getAdminData(): Promise<User[]> {
    return this.usersRepository.getAdminData();
  }

  async update(
    id: User['id'],
    payload: DeepPartial<User>,
  ): Promise<User | null> {
    const clonedPayload = { ...payload };
    console.log('payload', clonedPayload);
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

    return this.usersRepository.update(id, clonedPayload);
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.remove(id);
  }

  async incrementReferralAmount(id: User['id']): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (user) await this.usersRepository.increaseReferralAmount(user.id);
  }

  async setUserName(id: User['id'], new_name: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (user) await this.usersRepository.setUserName(id, new_name);
  }
}
