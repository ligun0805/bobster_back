/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { CreateNotificationDto } from '../notify/dto/create-notification.dto';
import { NotificationEntity } from '../notify/infrastructure/notification.entity';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
@WebSocketGateway(8000, { namespace: '/websocket', cors: { origin: '*' } })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  connectedUsers: Map<string, string> = new Map();

  constructor(
    private readonly chatsService: ChatsService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectBot('trader1Bot') private readonly trader1Bot: Telegraf<any>,
    @InjectBot('trader2Bot') private readonly trader2Bot: Telegraf<any>,
    @InjectBot('customerBot') private readonly customerBot: Telegraf<any>,
    @InjectBot('referrerBot') private readonly referrerBot: Telegraf<any>,
  ) {}

  afterInit(_server: Server) {
    console.log('WebSocket server initialized--');
  }

  async handleConnection(client: Socket) {
    console.log('trying to connect from client', client);
    const token = client.handshake.query.token;
    if (!token) return;
    const tokenString = token.toString();

    try {
      const userId = await this.authService.getUserIdFromToken(tokenString);

      if (!userId) {
        client.disconnect(true);

        return;
      }

      this.connectedUsers.set(client.id, userId.toString());

      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      console.log('error', error);
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: {
      senderId: number;
      receiverId: number | number[];
      orderId: string;
      ticketId: string;
      message: string;
    },
  ) {
    const receiverIds = Array.isArray(payload.receiverId)
      ? payload.receiverId
      : [payload.receiverId];

    const chatMessage = await this.chatsService.sendMessage(payload as any);
    const sender = await this.userRepository.findOne({
      where: {
        id: payload.senderId,
      },
    });

    // Отправляем сообщение всем получателям
    for (const receiver of receiverIds) {
      const receiverId = this.getByValue(this.connectedUsers, [receiver]);
      client.to(receiverId).emit('message', chatMessage);
      const notification = new CreateNotificationDto();
      notification.receiverId = Number(receiver);
      notification.title = 'New Message from ' + chatMessage[0].senderId; // Используем первого отправителя
      notification.content = chatMessage[0].message || '';
      notification.read = false;
      await this.sendNotificationToUser(
        receiver,
        notification,
        sender?.tgUserName,
      );
    }

    // Отправляем сообщение администраторам
    const adminData = await this.userService.getAdminData();
    for (const admin of adminData) {
      const adminReceiverId = this.getByValue(this.connectedUsers, [
        admin.id.toString(),
      ]);
      if (adminReceiverId.length > 0) {
        for (const receiver of adminReceiverId) {
          client.to(admin.id.toString()).emit('message', chatMessage);
          const notification = new CreateNotificationDto();
          notification.receiverId = chatMessage[0].receiverId; // Используем первого получателя
          notification.title = 'New Message from ' + chatMessage[0].senderId;
          notification.content = chatMessage[0].message || '';
          notification.read = false;
          await this.sendNotificationToUser(
            admin.id,
            notification,
            sender?.tgUserName,
          );
        }
      }
    }
  }

  @SubscribeMessage('sendMessageToSupport')
  async handleMessageToSupport(
    client: Socket,
    payload: {
      senderId: number;
      ticketId: string;
      message: string;
    },
  ) {
    const message = {
      senderId: payload.senderId,
      receiveId: 0,
      orderid: 'support',
      ticketId: payload.ticketId,
      message: payload.message,
    };
    const chatMessage = await this.chatsService.sendMessageToSupport(payload);
    const adminData = await this.userService.getAdminData();
    if (adminData.length) {
      for (let i = 0; i < adminData.length; i++) {
        const receiverId = this.getByValue(this.connectedUsers, [
          adminData[i].id.toString(),
        ]);
        if (receiverId) {
          client.to(receiverId).emit('message', chatMessage);
          const notification = new CreateNotificationDto();
          notification.receiverId = chatMessage.receiverId[0];
          notification.title = 'New Message from' + chatMessage.senderId;
          notification.content = chatMessage.message || '';
          notification.read = false;
          await this.sendNotificationToUser(adminData[i].id, notification);
        }
      }
    }
  }

  @SubscribeMessage('readMessage')
  async handleRead(
    client: Socket,
    payload: {
      chatMessageId: number;
    },
  ) {
    const chatMessage = await this.chatsService.readMessage(
      payload.chatMessageId,
    );
    const senderId = chatMessage.senderId.toString();
    client.to(senderId).emit('read', chatMessage.id);
  }

  async sendNotificationToUser(
    userId: number,
    notification: any,
    fromId?: string,
  ) {
    await this.notificationRepository.save(
      this.notificationRepository.create({
        receiverId: userId,
        title: notification.title,
        content: notification.content,
        read: false,
      }),
    );

    const clientId = this.getByValue(this.connectedUsers, [userId.toString()]);

    if (clientId) {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });
      if (user) {
        try {
          await (() => {
            if (user.role?.id === 2) {
              return this.referrerBot.telegram;
            } else if (user.role?.id === 3) {
              return this.customerBot.telegram;
            } else if (user.role?.id === 4) {
              return this.trader1Bot.telegram;
            }
            return this.trader2Bot.telegram;
          })().sendMessage(
            user.tgId,
            `New message from **${fromId || notification.from || 'Admin'}** \n ${notification.content}`,
          );
        } catch (error) {
          console.log(`No chat ${user.tgId}`);
        }
      }
      this.server.to(clientId).emit('notification', notification);
    }
  }

  @SubscribeMessage('readNotification')
  async handleReadNotification(
    client: Socket,
    payload: {
      notificationId: number;
    },
  ) {
    const notification = await this.notificationRepository.update(
      { id: payload.notificationId },
      {
        read: true,
      },
    );
  }

  getByValue(map, searchValues) {
    const keys = [];
    for (const searchValue of searchValues) {
      for (const [key, value] of map.entries()) {
        if (value === searchValue) {
          keys.push(key as never);
          break;
        }
      }
    }
    return keys;
  }
}
