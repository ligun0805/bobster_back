import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';
import { CurrencyEntity } from './infrastructure/currency.entity';
import { CurrencyPairsController } from '../currencyPairs/currencyPairs.controller';
import { CurrencyPairsService } from '../currencyPairs/currencyPairs.service';
import { CurrencyPairEntity } from '../currencyPairs/infrastructure/currencyPairs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity, CurrencyPairEntity])],
  controllers: [CurrenciesController, CurrencyPairsController],
  providers: [CurrenciesService, CurrencyPairsService],
})
export class CurrenciesModule {}
