import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({ example: 'Ever9Runner', type: String })
  @IsNotEmpty()
  tgId: string;
}
