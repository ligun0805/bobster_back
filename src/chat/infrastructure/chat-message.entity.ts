import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
@Entity('chat_messages')
export class ChatMessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column()
  orderId: string;

  @Column()
  ticketId: string;

  @Column()
  message: string;

  @Column()
  read: boolean;

  @Column()
  isFinished: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
