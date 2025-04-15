// src/language/infrastructure/language.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('languages')
export class LanguageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  file_path: string;
}
