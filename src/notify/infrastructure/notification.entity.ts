import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  receiverId: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
