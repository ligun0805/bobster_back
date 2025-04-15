import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../infrastructure/entities/user-verification.entity';

export class VerifyUserDto {
  @ApiProperty({ example: 'Ilon', description: 'Имя пользователя' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Mask', description: 'Фамилия пользователя' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'xxx',
    description: 'Отчество пользователя',
    required: false,
  })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({
    example: 'ID',
    enum: DocumentType,
    description: 'Тип документа (ID или PASSPORT)',
  })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  documentType: DocumentType;

  @ApiProperty({ example: '1234567890', description: 'Номер документа' })
  @IsString()
  @IsNotEmpty()
  documentId: string;
}
