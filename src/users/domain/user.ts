import { FileType } from '../../files/domain/file';
import { Role } from '../../roles/domain/role';
import { Status } from '../../statuses/domain/status';
import { ApiProperty } from '@nestjs/swagger';
import { ReferralCode } from '../../referralcodes/domain/referralcode';
import { Currency } from '../../base/currencies/domain/Currency';
import { Language } from '../../base/languages/domain/Language';

export class User {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'John Doe',
  })
  userName: string | null;

  @ApiProperty({
    type: String,
    example: '7386625900',
  })
  tgId: string;

  @ApiProperty({
    type: () => ReferralCode,
  })
  referralCode?: ReferralCode | null;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  referralAmount: number;

  @ApiProperty({
    type: () => FileType,
  })
  photo?: FileType | null;

  @ApiProperty({
    type: () => Role,
  })
  role?: Role | null;

  @ApiProperty({
    type: () => Currency,
  })
  myCurrency?: Currency | null;

  @ApiProperty({
    type: () => Currency,
  })
  receiverCurrency?: Currency | null;

  @ApiProperty({
    type: () => Language,
  })
  language?: Language | null;

  @ApiProperty({
    type: () => Boolean,
  })
  isVerified: boolean;

  tradeType: number;

  fee: number;

  currentBalance: number;

  processingBalance: number;

  @ApiProperty({
    type: () => Status,
  })
  status?: Status;

  orderCount?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty({
    type: String,
    example: 'TLcr7Hzd8kHatNzhBArsR4qaq2dRTiPNtc',
  })
  wallet: string | null;

  @ApiProperty()
  tgUserName: string;
}
