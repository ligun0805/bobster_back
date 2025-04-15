import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateChatMessageDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  senderId: number;

  @ApiProperty({ example: [2, 3], type: [Number] })
  @IsNotEmpty()
  @IsArray()
  receiverId: number[];

  @ApiProperty({ example: '32421345463', type: String })
  @IsString()
  orderId: string;

  @ApiProperty({ example: '1232421345463', type: String })
  @IsString()
  ticketId: string;

  @ApiProperty({ example: 'Hei, how are you...', type: String })
  @IsNotEmpty()
  @IsString()
  message: string;
}
