import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CurrencySeedService } from './currency-seed.service';
import { CurrencyEntity } from '../../../base/currencies/infrastructure/currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity])],
  providers: [CurrencySeedService],
  exports: [CurrencySeedService],
})
export class CurrencySeedModule {}
