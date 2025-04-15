import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, Repository, In, ILike } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { OrderEntity } from '../../../order/infrastructure/order.entity';
import { NullableType } from '../../../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from '../../dto/query-user.dto';
import { User } from '../../domain/user';
import { UserRepository } from '../user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { AuthEmailRegisterLoginDto } from '../../../auth/dto/auth-email-register.dto';
import { StatusEnum } from '../../../statuses/statuses.enum';

@Injectable()
export class UsersRelationalRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(OrderEntity)
    private readonly currencyRepository: Repository<OrderEntity>,
  ) {}

  async create(data: User): Promise<User> {
    const persistenceModel = UserMapper.toPersistence(data);
    const newEntity = await this.usersRepository.save(
      this.usersRepository.create(persistenceModel),
    );

    return UserMapper.toDomain(newEntity);
  }

  async createAdmin(dto: AuthEmailRegisterLoginDto): Promise<number> {
    const newAdmin = await this.usersRepository.create({
      userName: dto.email,
      tgId: dto.password,
      role: { id: 1 },
      status: { id: StatusEnum.active },
    });
    await this.usersRepository.save(newAdmin);
    return newAdmin.id;
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    const where: FindOptionsWhere<UserEntity> = {};

    if (filterOptions?.roles?.length) {
      where.role = { id: In(filterOptions.roles.map((role) => role.id)) };
    }
    if (paginationOptions?.keyword) {
      where.userName = ILike(`%${paginationOptions.keyword}%`);
    }

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'order')
      .loadRelationCountAndMap('user.orderCount', 'user.orders')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.status', 'status')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .where(where);
    // .addSelect(subQuery => {
    //   return subQuery
    //     .select('COUNT(order.id)', 'completedOrderCount')
    //     .from(OrderEntity, 'order')
    //     .where('order.customerId = user.id')
    //     .andWhere('order.status = :status', { status: 'completed' });
    // }, 'user.completedOrderCount')
    // .skip((paginationOptions.page - 1) * paginationOptions.limit)
    // .take(paginationOptions.limit)
    // .where(where);
    if (sortOptions?.length) {
      sortOptions.forEach((sort) => {
        if (sort.order && sort.orderBy)
          queryBuilder.addOrderBy(`user.${sort.orderBy}`, sort.order);
      });
    }
    const entities = await queryBuilder.getMany();

    return entities.map((user) => {
      const domainUser = UserMapper.toDomain(user);
      domainUser.orderCount = user['orderCount']; // Add order count to the domain model
      return domainUser;
    });
  }

  async findByEmail(email: string): Promise<NullableType<User>> {
    if (!email) return null;

    const entity = await this.usersRepository.findOne({
      where: { userName: email },
    });
    console.log('--------', email);
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findById(id: User['id']): Promise<NullableType<User>> {
    const entity = await this.usersRepository.findOne({
      where: { id: Number(id) },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByTel_userId(id: User['tgId']): Promise<NullableType<User>> {
    const entity = await this.usersRepository.findOne({
      where: { tgId: id },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByTel_userName(id: User['tgId']): Promise<NullableType<User>> {
    const entity = await this.usersRepository.findOne({
      where: { tgUserName: id },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findById_Entity(
    user_id: User['id'],
  ): Promise<NullableType<UserEntity>> {
    const entity = await this.usersRepository.findOne({
      where: { id: user_id },
    });
    return entity;
  }

  async getAdminData(): Promise<User[]> {
    const where: FindOptionsWhere<UserEntity> = {};
    where.role = { id: In([0, 1]) };

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'order')
      .loadRelationCountAndMap('user.orderCount', 'user.orders')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.status', 'status')
      .where(where);
    const entities = await queryBuilder.getMany();

    return entities.map((user) => {
      const domainUser = UserMapper.toDomain(user);
      domainUser.orderCount = user['orderCount']; // Add order count to the domain model
      return domainUser;
    });
  }

  async update(id: User['id'], payload: Partial<User>): Promise<User> {
    const entity = await this.usersRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('User not found');
    }

    const updatedEntity = await this.usersRepository.save(
      this.usersRepository.create(
        UserMapper.toPersistence({
          ...UserMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return UserMapper.toDomain(updatedEntity);
  }

  async increaseReferralAmount(user_id: number): Promise<void> {
    await this.usersRepository.increment({ id: user_id }, 'referralAmount', 1);
    await this.usersRepository.update;
    return;
  }

  async resetReferralAmount(user_id: number): Promise<void> {
    await this.usersRepository.update({ id: user_id }, { referralAmount: 0 });
  }

  async setUserName(user_id: number, new_Name: string): Promise<void> {
    await this.usersRepository.update({ id: user_id }, { userName: new_Name });
  }
  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }
}
