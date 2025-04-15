// src/review/review.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './infrastructure/review.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { OrderEntity } from '../order/infrastructure/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity, UserEntity, OrderEntity])],
  providers: [ReviewsService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
