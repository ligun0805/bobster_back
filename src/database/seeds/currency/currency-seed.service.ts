import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { CurrencyEntity } from '../../../base/currencies/infrastructure/currency.entity';

@Injectable()
export class CurrencySeedService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private repository: Repository<CurrencyEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      await this.repository.save(
        this.repository.create({
          code: 'USD',
          name: 'United States Dollar',
          symbol: '$',
          limit: 10000000,
        }),
      );
      await this.repository.save(
        this.repository.create({
          code: 'RUB',
          name: 'Russia Ruble',
          symbol: '₽',
          limit: 10000000,
        }),
      );
      await this.repository.save(
        this.repository.create({
          code: 'TRY',
          name: 'Turkish Lira',
          symbol: '₺',
          limit: 10000000,
        }),
      );

      await this.repository.save(
        this.repository.create({
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          limit: 10000000,
        }),
      );
    }
  }
}
