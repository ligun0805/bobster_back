import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/entities/user.entity';

@Entity('payment')
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' }) // Explicitly set the foreign key column name
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  amount: number;

  @Column()
  user_wallet: string;

  @Column()
  admin_wallet: string;

  @Column({ unique: true, nullable: true })
  tx_hash: string;

  @Column()
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
