import { Module } from '@nestjs/common';

import { RelationalSessionPersistenceModule } from './infrastructure/relational-persistence.module';
import { SessionService } from './session.service';

// <database-block>
const infrastructurePersistenceModule = RelationalSessionPersistenceModule;
// </database-block>

@Module({
  imports: [infrastructurePersistenceModule],
  providers: [SessionService],
  exports: [SessionService, infrastructurePersistenceModule],
})
export class SessionModule {}
