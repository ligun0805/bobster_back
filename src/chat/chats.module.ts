import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { Repository } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { ChatMessageEntity } from './infrastructure/chat-message.entity';
// import { AppGateway } from './chats.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repository, UserEntity, ChatMessageEntity]),
    AuthModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatModule {}
