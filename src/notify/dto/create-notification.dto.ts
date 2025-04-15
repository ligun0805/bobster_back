import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 23, type: Number })
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @ApiProperty({ example: 'Notification Title', type: String })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Notification content goes here...', type: String })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: false, type: Boolean })
  @IsNotEmpty()
  read: boolean;
}
