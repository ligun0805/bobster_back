import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralCodeEntity } from './referralcode.entity';
import { ReferralCodeRepository } from './referralcode.repository';
import { ReferralCodeRelationalRepository } from './repositories/referralcode.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReferralCodeEntity])],
  providers: [
    {
      provide: ReferralCodeRepository,
      useClass: ReferralCodeRelationalRepository,
    },
  ],
  exports: [ReferralCodeRepository],
})
export class RelationalReferralCodePersistenceModule {}
