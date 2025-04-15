import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('currency')
export class CurrencyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // e.g., 'USD', 'EUR', 'RUB', 'TRY'

  @Column()
  name: string; // e.g., 'United States Dollar', 'Euro', 'Russian Ruble', 'Turkish Lira'

  @Column()
  symbol: string; // e.g., '$', '€', '₽', '₺'

  @Column('decimal', { precision: 16, scale: 0 })
  limit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
