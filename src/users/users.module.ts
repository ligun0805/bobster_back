import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RelationalUserPersistenceModule } from './infrastructure/relational-persistence.module';
import { ReferralCodesModule } from '../referralcodes/referralcodes.module';
import { UserVerificationEntity } from './infrastructure/entities/user-verification.entity';

// <database-block>
const infrastructurePersistenceModule = RelationalUserPersistenceModule;
// </database-block>

@Module({
  imports: [
    infrastructurePersistenceModule,
    ReferralCodesModule,
    TypeOrmModule.forFeature([UserVerificationEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, infrastructurePersistenceModule],
})
export class UsersModule {}
