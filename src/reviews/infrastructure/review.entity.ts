// src/review/infrastructure/review.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/entities/user.entity';
import { OrderEntity } from '../../order/infrastructure/order.entity';

export enum ReviewType {
  Fast = 'Fast',
  Safety = 'Safety',
  GoodPrice = 'GoodPrice',
}

@Entity('reviews')
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrderEntity)
  order: OrderEntity;

  @ManyToOne(() => UserEntity)
  trader: UserEntity;

  @ManyToOne(() => UserEntity)
  customer: UserEntity;

  @Column({
    type: 'enum',
    enum: ReviewType,
  })
  type: ReviewType;

  @Column('int')
  score: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
