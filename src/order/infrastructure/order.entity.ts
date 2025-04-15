// src/order/infrastructure/order.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/entities/user.entity';
import { PaymentMethodEntity } from '../../base/payment-methods/infrastructure/payment-method.entity';
import { CurrencyEntity } from '../../base/currencies/infrastructure/currency.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => CurrencyEntity)
  customerCurrency: CurrencyEntity;

  @ManyToOne(() => CurrencyEntity)
  receiverCurrency: CurrencyEntity;

  @ManyToOne(() => UserEntity, (user) => user.orders)
  customer: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.orders)
  trader1: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.orders, { nullable: true })
  trader2: UserEntity;

  @Column()
  amount: number;

  @Column()
  usdtAmount: number;

  @Column()
  traderPaymentMethodId: number;

  @ManyToOne(() => PaymentMethodEntity)
  paymentMethod: PaymentMethodEntity;

  @Column()
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  traderDepositedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  customerSentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  traderReceivedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  traderPaidAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  trader2ParticipatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  customerConfirmedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  canceledAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'int' })
  orderType: number;

  @Column('decimal', { precision: 5, scale: 2 })
  traderFee: number;

  @Column('decimal', { precision: 5, scale: 2 })
  refererFee: number;

  @Column({ type: 'varchar', nullable: true })
  receiptFilePath: string;

  @Column({ type: 'varchar', nullable: true })
  transferFilePath: string;
}
