import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';
import { CurrencyEntity } from '../../../base/currencies/infrastructure/currency.entity';
import { RoleEnum } from '../../../roles/roles.enum';

@Entity('addresses')
export class AddressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  street: string;

  @Column()
  fullAddress: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyId' })
  currency: CurrencyEntity;

  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.trader2 })
  userRole: RoleEnum;
}
