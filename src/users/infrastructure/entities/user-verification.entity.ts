import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum DocumentType {
  ID = 'ID',
  PASSPORT = 'PASSPORT',
}

@Entity({ name: 'user_verifications' })
export class UserVerificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserEntity, (user) => user.verification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  middleName?: string;

  @Column({ type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ type: 'varchar' })
  documentId: string;

  @CreateDateColumn()
  createdAt: Date;
}
