import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AuthReferralRegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString() userName: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  tgId: string;

  @ApiProperty({ example: 'Ever9Runner' })
  @IsString()
  @IsNotEmpty()
  tgUserName: string;

  @ApiProperty({
    example: '278a4156-bc82-4e5f-ba52-c62450261e73',
  })
  @IsString()
  @Length(36, 36, { message: 'Referral code must be a UUID' })
  referralCode: string;
}