import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { ChatMessageEntity } from './infrastructure/chat-message.entity';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateSupportChatMessageDto } from './dto/create-support-chat.dto';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { IPaginationOptions } from '../utils/types/pagination-options';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly chatMessageRepository: Repository<ChatMessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async sendMessage(
    createChatMessageDto: CreateChatMessageDto,
  ): Promise<ChatMessageEntity[]> {
    const { senderId, receiverId, orderId, ticketId, message } =
      createChatMessageDto;

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    if (!sender) {
      throw new NotFoundException('Invalid sender');
    }

    const savedMessages: ChatMessageEntity[] = [];

    for (const receiver of receiverId) {
      const receiverUser = await this.userRepository.findOne({
        where: { id: receiver },
      });

      if (!receiverUser) {
        throw new NotFoundException(`Invalid receiver: ${receiver}`);
      }

      if (!receiverId.includes(0) || !receiverId.includes(1)) {
        const chatMessage = this.chatMessageRepository.create({
          senderId,
          receiverId: receiver,
          orderId,
          ticketId,
          message,
          read: false,
          isFinished: false,
        });

        console.log('chatMessage', chatMessage);

        const savedMessage = await this.chatMessageRepository.save(chatMessage);
        console.log(savedMessage);
        savedMessages.push(savedMessage);
      }
    }

    return savedMessages; // Возвращаем массив сохраненных сообщений
  }

  async sendMessageToSupport(
    CreateSupportChatMessageDto: CreateSupportChatMessageDto,
  ): Promise<ChatMessageEntity> {
    const { senderId, ticketId, message } = CreateSupportChatMessageDto;

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    if (!sender) {
      throw new NotFoundException('Invalid sender');
    }

    const chatMessage = this.chatMessageRepository.create({
      senderId: sender.id,
      receiverId: 0,
      orderId: 'support',
      ticketId: ticketId,
      message: message,
      read: false,
      isFinished: false,
    });
    const savedMessage = await this.chatMessageRepository.save(chatMessage);

    // Notify about the new chat message
    //  await this.notificationService.notifyNewChatMessage(savedMessage);

    return savedMessage;
  }

  async readMessage(chatMessageId: number): Promise<ChatMessageEntity> {
    await this.chatMessageRepository.update(
      { id: chatMessageId },
      { read: true },
    );
    const message = await this.chatMessageRepository.findOne({
      where: { id: chatMessageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  async finishChat(orderId: string) {
    await this.chatMessageRepository.update(
      { orderId: orderId },
      { isFinished: true },
    );
  }

  async finishTicket(ticketId: string) {
    await this.chatMessageRepository.update(
      { ticketId: ticketId },
      { isFinished: true },
    );
  }

  async findManyWithPagination({
    userId,
    isFinished,
    isChat,
    paginationOptions,
  }: {
    userId: number;
    isFinished: boolean;
    isChat: boolean;
    paginationOptions: IPaginationOptions;
  }): Promise<ChatMessageEntity[]> {
    const where: FindOptionsWhere<ChatMessageEntity> = {};

    if (paginationOptions?.keyword) {
      where.message = ILike(`%${paginationOptions.keyword}%`);
    }
    where.isFinished = isFinished;

    if (isChat === true) {
      const queryBuilder = this.chatMessageRepository
        .createQueryBuilder('chatMessage')
        .select('chatMessage.orderId')
        .addSelect('COUNT(chatMessage.id)', 'messageCount')
        .addSelect(
          'SUM(CASE WHEN (chatMessage.read = false AND chatMessage.receiverId = :userId) THEN 1 ELSE 0 END)',
          'unreadCount',
        )
        .setParameter('userId', userId)
        .skip((paginationOptions.page - 1) * paginationOptions.limit)
        .take(paginationOptions.limit)
        .where(where)
        .groupBy('chatMessage.orderId');
      return queryBuilder.getRawMany();
    } else {
      const queryBuilder = this.chatMessageRepository
        .createQueryBuilder('chatMessage')
        .select('chatMessage.ticketId')
        .addSelect('COUNT(chatMessage.id)', 'messageCount')
        .addSelect(
          'SUM(CASE WHEN (chatMessage.read = false AND chatMessage.receiverId = :userId) THEN 1 ELSE 0 END)',
          'unreadCount',
        )
        .setParameter('userId', userId)
        .skip((paginationOptions.page - 1) * paginationOptions.limit)
        .take(paginationOptions.limit)
        .where(where)
        .groupBy('chatMessage.ticketId');
      return queryBuilder.getRawMany();
    }
  }

  findAllChatsManyWithPagination({
    roleId,
    userId,
    isFinished,
    paginationOptions,
  }: {
    roleId: number;
    userId: number;
    isFinished: boolean;
    paginationOptions: IPaginationOptions;
  }): Promise<any[]> {
    let queryBuilder: any;
    if (roleId == 0 || roleId == 1) {
      queryBuilder = this.chatMessageRepository
        .createQueryBuilder('chatMessage')
        .select([
          `CASE WHEN chatMessage.orderId = 'support' THEN chatMessage.ticketId ELSE chatMessage.orderId END AS order_ticket_id`, // Grouping by ticketId or orderId
          'MAX(chatMessage.createdAt) AS lastMessageAt', // Example: get the last message time
          'COUNT(chatMessage.id) AS messageCount', // Total messages in the group
          `SUM(CASE WHEN chatMessage.read = false THEN 1 ELSE 0 END) AS unreadCount`, // Count of unread messages
          `MAX(CASE WHEN chatMessage.orderId = 'support' THEN 0 ELSE 1 END) AS isChat`,
        ])
        .andWhere('chatMessage.isFinished = :isFinished', {
          isFinished: isFinished,
        });
    } else {
      queryBuilder = this.chatMessageRepository
        .createQueryBuilder('chatMessage')
        .select([
          `CASE WHEN chatMessage.orderId = 'support' THEN chatMessage.ticketId ELSE chatMessage.orderId END AS order_ticket_id`, // Grouping by ticketId or orderId
          'MAX(chatMessage.createdAt) AS lastMessageAt', // Example: get the last message time
          'COUNT(chatMessage.id) AS messageCount', // Total messages in the group
          `SUM(CASE WHEN chatMessage.read = false THEN 1 ELSE 0 END) AS unreadCount`, // Count of unread messages
          `MAX(CASE WHEN chatMessage.orderId = 'support' THEN 0 ELSE 1 END) AS isChat`,
        ])
        .andWhere('chatMessage.isFinished = :isFinished', {
          isFinished: isFinished,
        })
        .andWhere(
          '(chatMessage.receiverId = :userId OR chatMessage.senderId = :userId)',
          { userId },
        );
    }

    if (paginationOptions?.keyword) {
      queryBuilder.andWhere('chatMessage.message ILIKE :keyword', {
        keyword: `%${paginationOptions.keyword}%`,
      });
    }

    queryBuilder
      .groupBy('order_ticket_id') // Grouping by ticketId
      .orderBy('lastMessageAt', 'DESC') // Sort by the last message time
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit);

    return queryBuilder.getRawMany();
  }

  findSupportManyWithPagination({
    roleId,
    userId,
    isFinished,
    paginationOptions,
  }: {
    roleId: number;
    userId: number;
    isFinished: boolean;
    paginationOptions: IPaginationOptions;
  }): Promise<any[]> {
    let queryBuilder: any;
    if (roleId == 0 || roleId == 1) {
      queryBuilder = this.chatMessageRepository
        .createQueryBuilder('chatMessage')
        .select([
          'chatMessage.ticketId', // Grouping by ticketId
          'MAX(chatMessage.createdAt) AS lastMessageAt', // Example: get the last message time
          'COUNT(chatMessage.id) AS messageCount', // Total messages in the group
          `SUM(CASE WHEN chatMessage.read = false THEN 1 ELSE 0 END) AS unreadCount`, // Count of unread messages
        ])
        .where('chatMessage.orderId = :orderId', { orderId: 'support' })
        .andWhere('chatMessage.isFinished = :isFinished', {
          isFinished: isFinished,
        });
    } else {
      queryBuilder = this.chatMessageRepository
        .createQueryBuilder('chatMessage')
        .select([
          'chatMessage.ticketId', // Grouping by ticketId
          'MAX(chatMessage.createdAt) AS lastMessageAt', // Example: get the last message time
          'COUNT(chatMessage.id) AS messageCount', // Total messages in the group
          `SUM(CASE WHEN chatMessage.read = false THEN 1 ELSE 0 END) AS unreadCount`, // Count of unread messages
        ])
        .where('chatMessage.orderId = :orderId', { orderId: 'support' })
        .andWhere('chatMessage.isFinished = :isFinished', {
          isFinished: isFinished,
        })
        .andWhere(
          '(chatMessage.receiverId = :userId OR chatMessage.senderId = :userId)',
          { userId },
        );
    }

    if (paginationOptions?.keyword) {
      queryBuilder.andWhere('chatMessage.message ILIKE :keyword', {
        keyword: `%${paginationOptions.keyword}%`,
      });
    }

    queryBuilder
      .groupBy('chatMessage.ticketId') // Grouping by ticketId
      .orderBy('lastMessageAt', 'DESC') // Sort by the last message time
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit);

    return queryBuilder.getRawMany();
  }

  findOrderManyWithPagination({
    roleId,
    userId,
    isFinished,
    paginationOptions,
  }: {
    roleId: number;
    userId: number;
    isFinished: boolean;
    paginationOptions: IPaginationOptions;
  }): Promise<any[]> {
    let queryBuilder: any;
    if (roleId == 0 || roleId == 1) {
      queryBuilder = this.chatMessageRepository
        .createQueryBuilder('chatMessage')
        .select([
          'chatMessage.orderId', // Grouping by orderId
          'MAX(chatMessage.createdAt) AS lastMessageAt', // Example: get the last message time
          'COUNT(chatMessage.id) AS messageCount', // Total messages in the group
          `SUM(CASE WHEN chatMessage.read = false THEN 1 ELSE 0 END) AS unreadCount`, // Count of unread messages
        ])
        .where('chatMessage.orderId != :orderId', { orderId: 'support' })
        .andWhere('chatMessage.isFinished = :isFinished', {
          isFinished: isFinished,
        });
    } else {
      queryBuilder = this.chatMessageRepository
        .createQueryBuilder('chatMessage')
        .select([
          'chatMessage.orderId', // Grouping by orderId
          'MAX(chatMessage.createdAt) AS lastMessageAt', // Example: get the last message time
          'COUNT(chatMessage.id) AS messageCount', // Total messages in the group
          `SUM(CASE WHEN chatMessage.read = false THEN 1 ELSE 0 END) AS unreadCount`, // Count of unread messages
        ])
        .where('chatMessage.orderId != :orderId', { orderId: 'support' })
        .andWhere('chatMessage.isFinished = :isFinished', {
          isFinished: isFinished,
        })
        .andWhere(
          '(chatMessage.receiverId = :userId OR chatMessage.senderId = :userId)',
          { userId },
        );
    }

    if (paginationOptions?.keyword) {
      queryBuilder.andWhere('chatMessage.message ILIKE :keyword', {
        keyword: `%${paginationOptions.keyword}%`,
      });
    }

    queryBuilder
      .groupBy('chatMessage.orderId') // Grouping by orderId
      .orderBy('lastMessageAt', 'DESC') // Sort by the last message time
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit);

    return queryBuilder.getRawMany();
  }

  async findAllChatListManyWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<ChatMessageEntity[]> {
    const where: FindOptionsWhere<ChatMessageEntity> = {};

    if (paginationOptions?.keyword) {
      where.message = ILike(`%${paginationOptions.keyword}%`);
    }
    const queryBuilder = this.chatMessageRepository
      .createQueryBuilder('chatMessage')
      .select([
        'chatMessage.id',
        'chatMessage.orderId',
        'chatMessage.senderId',
        'chatMessage.receiverId',
        'chatMessage.message',
        'chatMessage.read',
        'chatMessage.createdAt',
      ])
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .where(where);
    return queryBuilder.getRawMany();
  }

  async findById({
    userId,
    id,
    isChat,
    paginationOptions,
  }: {
    userId: number;
    id: string;
    isChat: boolean;
    paginationOptions: IPaginationOptions;
  }): Promise<ChatMessageEntity[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (isChat) {
      const queryBuilder = this.chatMessageRepository
        .createQueryBuilder('chatMessage')
        .select([
          'chatMessage.id',
          'chatMessage.orderId',
          'chatMessage.senderId',
          'chatMessage.receiverId',
          'chatMessage.message',
          'chatMessage.read',
          'chatMessage.isFinished',
          'chatMessage.createdAt',
        ])
        .where('chatMessage.orderId = :orderId', { orderId: id })
        .orderBy('chatMessage.createdAt', 'ASC');

      if (paginationOptions?.keyword) {
        queryBuilder.andWhere('chatMessage.message ILIKE :keyword', {
          keyword: `%${paginationOptions.keyword}%`,
        });
      }

      console.log('Generated SQL:', queryBuilder.getSql());
      console.log('Query parameters:', { orderId: id });

      const results = await queryBuilder.getRawMany();

      if (user?.role?.id == 0 || user?.role?.id == 1) {
        // Если пользователь администратор, добавляем роли отправителей и получателей
        for (const message of results) {
          const sender = await this.userRepository.findOne({
            where: { id: message.chatMessage_senderId },
          });
          const receiver = await this.userRepository.findOne({
            where: { id: message.chatMessage_receiverId },
          });
          message.senderRole = sender?.role; // Добавляем роль отправителя
          message.receiverRole = receiver?.role; // Добавляем роль получателя
        }
      }

      return results;
    } else {
      const where: FindOptionsWhere<ChatMessageEntity> = {};

      if (paginationOptions?.keyword) {
        where.message = ILike(`%${paginationOptions.keyword}%`);
      }

      where.ticketId = id;

      const queryBuilder = this.chatMessageRepository
        .createQueryBuilder('chatMessage')
        .select([
          'chatMessage.id',
          'chatMessage.orderId',
          'chatMessage.senderId',
          'chatMessage.message',
          'chatMessage.read',
          'chatMessage.isFinished',
          'chatMessage.createdAt',
        ])
        .where(where)
        .orderBy('chatMessage.createdAt', 'DESC')
        .skip((paginationOptions.page - 1) * paginationOptions.limit)
        .take(paginationOptions.limit);
      return queryBuilder.getRawMany();
    }
  }

  async findChatById({ id }: { id: string }): Promise<ChatMessageEntity[]> {
    const where: FindOptionsWhere<ChatMessageEntity> = {};
    where.id = Number(id);
    const queryBuilder = this.chatMessageRepository
      .createQueryBuilder('chatMessage')
      .select([
        'chatMessage.orderId',
        'chatMessage.senderId',
        'chatMessage.message',
        'chatMessage.read',
        'chatMessage.createdAt',
      ])
      .where(where);
    return queryBuilder.getRawMany();
  }
}
