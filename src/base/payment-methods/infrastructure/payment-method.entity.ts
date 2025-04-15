// src/base/payment-methods/infrastructure/payment-method.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PaymentMethodType } from '../dto/method-type.enum';

@Entity('payment_method')
export class PaymentMethodEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
  })
  type: PaymentMethodType;

  @Column('json')
  details: string;

  @Column()
  userId: number;
}
