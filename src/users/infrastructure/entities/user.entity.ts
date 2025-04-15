import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { RoleEntity } from '../../../roles/infrastructure/role.entity';
import { StatusEntity } from '../../../statuses/infrastructure/status.entity';
import { ReferralCodeEntity } from '../../../referralcodes/infrastructure/referralcode.entity';
import { FileEntity } from '../../../files/infrastructure/persistence/relational/entities/file.entity';
import { OrderEntity } from '../../../order/infrastructure/order.entity';
import { PaymentMethodEntity } from '../../../base/payment-methods/infrastructure/payment-method.entity';
import { CurrencyEntity } from '../../../base/currencies/infrastructure/currency.entity';
import { LanguageEntity } from '../../../base/languages/infrastructure/language.entity';
import { UserVerificationEntity } from './user-verification.entity';
import { AddressEntity } from '../../../base/addresses/infrastructure/address.entity';
import { EntityRelationalHelper } from '../../../utils/relational-entity-helper';

// We use class-transformer in ORM entity and domain entity.
// We duplicate these rules because you can choose not to use adapters
// in your project and return an ORM entity directly in response.
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'user',
})
export class UserEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    example: 'John Doe',
  })
  @Index()
  @Column({ type: String, nullable: true })
  userName: string | null;

  @ApiProperty({
    type: String,
    example: '12345678',
  })
  @Column({ type: String, nullable: true })
  tgId: string;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  @Column({ type: Number, default: 0 })
  referralAmount: number;

  @ApiProperty({
    type: () => ReferralCodeEntity,
  })
  @OneToOne(() => ReferralCodeEntity, {
    eager: true,
  })
  @JoinColumn()
  referralCode?: ReferralCodeEntity | null;

  @ApiProperty({
    type: () => FileEntity,
  })
  @OneToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn()
  photo?: FileEntity | null;

  @ApiProperty({
    type: () => RoleEntity,
  })
  @ManyToOne(() => RoleEntity, {
    eager: true,
  })
  role?: RoleEntity | null;

  @ApiProperty({
    type: () => StatusEntity,
  })
  @ManyToOne(() => StatusEntity, {
    eager: true,
  })
  status?: StatusEntity;

  @OneToMany(() => OrderEntity, (order) => order.customer)
  orders: OrderEntity[];

  @OneToMany(() => PaymentMethodEntity, (paymentMethod) => paymentMethod.userId)
  paymentMethods: PaymentMethodEntity[];

  @OneToOne(() => CurrencyEntity, {
    eager: true,
  })
  @JoinColumn()
  myCurrency?: CurrencyEntity;

  @ManyToOne(() => CurrencyEntity)
  receiverCurrency?: CurrencyEntity;

  @OneToOne(() => LanguageEntity, {
    eager: true,
  })
  @JoinColumn()
  language?: LanguageEntity;

  @Column('int')
  tradeType: number;

  @Column('decimal', { precision: 5, scale: 2 })
  fee: number;

  @Column('decimal', { precision: 18, scale: 2 })
  currentBalance: number;

  @Column('decimal', { precision: 18, scale: 2 })
  processingBalance: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;

  @ApiProperty({
    type: String,
    example: 'TLcr7Hzd8kHatNzhBArsR4qaq2dRTiPNtc',
  })
  @Column({ type: String, nullable: true })
  wallet: string | null;

  @ApiProperty({
    type: String,
    example: 'kingchrisbro',
  })
  @Column({ type: String, nullable: true })
  tgUserName: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  @Column({ default: false })
  isVerified: boolean;

  @OneToOne(() => UserVerificationEntity, (verification) => verification.user, {
    cascade: true,
  })
  verification: UserVerificationEntity;

  // ✅ Исправленное добавление `addresses`
  @OneToMany(() => AddressEntity, (address) => address.user)
  addresses: AddressEntity[];
}
