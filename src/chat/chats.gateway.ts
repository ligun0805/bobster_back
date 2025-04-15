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
      client.join(userId.toString());
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
    // const receiverIds = this.getByValue(
    //   this.connectedUsers,
    //   receiverIds.map((id) => id.toString()),
    // );

    const chatMessage = await this.chatsService.sendMessage(payload as any);

    // Отправляем сообщение всем получателям
    for (const userId of receiverIds) {
      this.server.to(userId).emit('message', chatMessage);
      const notification = new CreateNotificationDto();
      notification.receiverId = userId;
      notification.title = 'New Message from ' + chatMessage[0].senderId; 
      notification.content = chatMessage[0].message || '';
      notification.read = false;
      await this.sendNotificationToUser(userId, notification);
    }

    // Отправляем сообщение администраторам
    const adminData = await this.userService.getAdminData();
    for (const admin of adminData) {
      const adminReceiverId = this.getByValue(this.connectedUsers, [
        admin.id.toString(),
      ]);
      if (adminReceiverId.length > 0) {
        for (const admin of adminReceiverId) {
          this.server.to(admin.id.toString()).emit('message', chatMessage);
          const notification = new CreateNotificationDto();
          notification.receiverId = admin.id; 
          notification.title = 'New Message from ' + chatMessage[0].senderId;
          notification.content = chatMessage[0].message || '';
          notification.read = false;
          await this.sendNotificationToUser(admin.id, notification);
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
    this.server.to(senderId).emit('read', chatMessage.id);
  }

  async sendNotificationToUser(userId: number, notification: any) {
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
