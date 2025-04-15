import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SettingUpdateDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  myCurrencyId: number;

  @ApiProperty({ example: 2, type: Number })
  @IsNotEmpty()
  receiverCurrencyId: number;

  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  languageId: number;
}
