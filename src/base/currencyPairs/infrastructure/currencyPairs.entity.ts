import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CurrencyEntity } from '../../currencies/infrastructure/currency.entity';

@Entity('currency_pairs')
export class CurrencyPairEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'baseCurrencyId' })
  baseCurrencyId: CurrencyEntity;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'targetCurrencyId' })
  targetCurrencyId: CurrencyEntity;

  @Column('decimal', { precision: 18, scale: 8 })
  exchangeRate: number;

  @Column('decimal', { precision: 10, scale: 8 })
  profit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
