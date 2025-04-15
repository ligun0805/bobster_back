import { forwardRef, Module } from '@nestjs/common';

import { RelationalReferralCodePersistenceModule } from './infrastructure/relational-persistence.module';
import { ReferralCodeService } from './referralcodes.service';
import { ReferralcodesController } from './referralcodes.controller';
import { ReferralCodeRepository } from './infrastructure/referralcode.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

// <database-block>
const infrastructurePersistenceModule = RelationalReferralCodePersistenceModule;
// </database-block>

@Module({
  imports: [
    infrastructurePersistenceModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([ReferralCodeRepository]),
  ],
  controllers: [ReferralcodesController],
  providers: [ReferralCodeService],
  exports: [ReferralCodeService, infrastructurePersistenceModule],
})
export class ReferralCodesModule {}
