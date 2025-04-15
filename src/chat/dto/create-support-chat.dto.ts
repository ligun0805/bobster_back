import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
export class CreateSupportChatMessageDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  senderId: number;

  @ApiProperty({ example: '1232421345463', type: String })
  @IsString()
  ticketId: string;

  @ApiProperty({ example: 'Hei, how are you...', type: String })
  @IsNotEmpty()
  @IsString()
  message: string;
}
