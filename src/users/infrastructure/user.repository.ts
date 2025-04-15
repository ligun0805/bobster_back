import { AuthEmailRegisterLoginDto } from '../../auth/dto/auth-email-register.dto';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { User } from '../domain/user';

import { FilterUserDto, SortUserDto } from '../dto/query-user.dto';
import { UserEntity } from './entities/user.entity';

export abstract class UserRepository {
  abstract create(
    data: Omit<
      User,
      'id' | 'createdAt' | 'deletedAt' | 'updatedAt' | 'isVerified'
    >,
  ): Promise<User>;

  abstract createAdmin(dto: AuthEmailRegisterLoginDto): Promise<number>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]>;

  abstract findByEmail(email: string): Promise<NullableType<User>>;
  abstract findById(id: User['id']): Promise<NullableType<User>>;
  abstract findById_Entity(id: User['id']): Promise<NullableType<UserEntity>>;
  abstract findByTel_userId(id: User['tgId']): Promise<NullableType<User>>;
  abstract findByTel_userName(
    id: User['tgUserName'],
  ): Promise<NullableType<User>>;

  abstract getAdminData(): Promise<User[]>;

  abstract update(
    id: User['id'],
    payload: DeepPartial<User>,
  ): Promise<User | null>;

  abstract remove(id: User['id']): Promise<void>;
  abstract increaseReferralAmount(id: number): Promise<void>;
  abstract setUserName(id: number, new_name: string): Promise<void>;
}
