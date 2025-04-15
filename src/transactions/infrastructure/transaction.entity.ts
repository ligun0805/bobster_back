import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // Уникальный идентификатор транзакции
  txHash: string;

  @Column()
  sender: string;

  @Column('decimal', { precision: 18, scale: 6 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}
