import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AuthCreateRefererDto {
  @ApiProperty({ example: 'Ever9Runner', type: String })
  @IsString()
  @IsNotEmpty()
  tgUserName: string;
}
