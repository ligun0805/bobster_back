import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { NotificationEntity } from './infrastructure/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AppGateway } from '../chat/chats.gateway';
import { IPaginationOptions } from '../utils/types/pagination-options';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepository: Repository<NotificationEntity>,

    private readonly appGateway: AppGateway,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    );
    return this.notificationsRepository.save(notification);
  }

  async findManyWithPagination({
    userId,
    paginationOptions,
  }: {
    userId: number;
    paginationOptions: IPaginationOptions;
  }): Promise<NotificationEntity[]> {
    const where: FindOptionsWhere<NotificationEntity> = {};
    where.receiverId = userId;

    const queryBuilder = this.notificationsRepository
      .createQueryBuilder('notification')
      .select([
        'notification.title',
        'notification.content',
        'notification.createdAt',
      ])
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .where(where);
    return queryBuilder.getRawMany();
  }
}
