import { NestFactory } from '@nestjs/core';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';
import { StatusSeedService } from './status/status-seed.service';
import { UserSeedService } from './user/user-seed.service';
import { ReferralCodeSeedService } from './referralCode/referralCode-seed.service';
import { CurrencySeedService } from './currency/currency-seed.service';
import { FeeSchedulesSeedService } from './feeSchedule/feeSchedule-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run
  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();
  await app.get(ReferralCodeSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(CurrencySeedService).run();
  await app.get(FeeSchedulesSeedService).run();

  await app.close();
};

void runSeed();
