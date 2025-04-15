import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyPairEntity } from './infrastructure/currencyPairs.entity';
import { CreateCurrencyPairDto } from './dto/create-currencyPair.dto';
import { UpdateCurrencyPairDto } from './dto/update-currencyPair.dto';
import { RemoveCurrencyPairDto } from './dto/remove-currencyPair.dto';
import { GetExchangeRateDto } from './dto/get-exchange-rate.dto';
import { CurrencyEntity } from '../currencies/infrastructure/currency.entity';

@Injectable()
export class CurrencyPairsService {
  constructor(
    @InjectRepository(CurrencyPairEntity)
    private readonly currencyPairRepository: Repository<CurrencyPairEntity>,
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
  ) {}

  async create(
    createCurrencyPairDto: CreateCurrencyPairDto,
  ): Promise<CurrencyPairEntity> {
    const { baseCurrencyId, targetCurrencyId, exchangeRate, profit } =
      createCurrencyPairDto;

    // Check if the currency pair already exists
    const existingPair = await this.currencyPairRepository.findOne({
      where: {
        baseCurrencyId: { id: baseCurrencyId },
        targetCurrencyId: { id: targetCurrencyId },
      },
    });

    if (existingPair) {
      throw new ConflictException('Currency pair already exists');
    }

    const existingCurrencyBase = await this.currencyRepository.findOne({
      where: { id: baseCurrencyId },
    });

    if (!existingCurrencyBase) {
      throw new ConflictException('Base currency not found');
    }

    const existingCurrencyTarget = await this.currencyRepository.findOne({
      where: { id: targetCurrencyId },
    });

    if (!existingCurrencyTarget) {
      throw new NotFoundException('Target currency not found');
    }

    const currencyPair = this.currencyPairRepository.create({
      baseCurrencyId: { id: baseCurrencyId },
      targetCurrencyId: { id: targetCurrencyId },
      exchangeRate,
      profit,
    });

    return this.currencyPairRepository.save(currencyPair);
  }

  async update(
    updateCurrencyPairDto: UpdateCurrencyPairDto,
  ): Promise<CurrencyPairEntity> {
    const { id, exchangeRate, profit } = updateCurrencyPairDto;

    const currencyPair = await this.currencyPairRepository.findOne({
      where: { id: id },
    });

    if (!currencyPair) {
      throw new NotFoundException('Currency pair not found');
    }

    currencyPair.exchangeRate = exchangeRate;
    currencyPair.profit = profit;
    return this.currencyPairRepository.save(currencyPair);
  }

  async findAll(): Promise<CurrencyPairEntity[]> {
    return this.currencyPairRepository.find({
      relations: ['baseCurrencyId', 'targetCurrencyId'],
    });
  }

  async getExchangeRate(
    getExchangeRateDto: GetExchangeRateDto,
  ): Promise<CurrencyPairEntity> {
    const { baseCurrencyId, targetCurrencyId } = getExchangeRateDto;

    const currencyPair = await this.currencyPairRepository.findOne({
      where: {
        baseCurrencyId: { id: baseCurrencyId },
        targetCurrencyId: { id: targetCurrencyId },
      },
      relations: ['baseCurrencyId', 'targetCurrencyId'],
    });

    if (!currencyPair) {
      throw new NotFoundException('Currency pair not found');
    }

    return currencyPair;
  }

  async delete(deleteCurrencyPairDto: RemoveCurrencyPairDto): Promise<void> {
    const { id } = deleteCurrencyPairDto;
    const result = await this.currencyPairRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Currency pair with ID ${id} not found`);
    }
  }
}
