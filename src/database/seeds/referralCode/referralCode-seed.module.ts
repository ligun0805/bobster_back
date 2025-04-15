import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralCodeSeedService } from './referralCode-seed.service';
import { ReferralCodeEntity } from '../../../referralcodes/infrastructure/referralcode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReferralCodeEntity])],
  providers: [ReferralCodeSeedService],
  exports: [ReferralCodeSeedService],
})
export class ReferralCodeSeedModule {}
