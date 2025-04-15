import {
  Injectable,
  UnprocessableEntityException,
  HttpStatus,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrencyEntity } from './infrastructure/currency.entity';
import { CurrencyPairEntity } from '../currencyPairs/infrastructure/currencyPairs.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { GetCurrencyDto } from './dto/get-currency.dto';
import { RemoveCurrencyDto } from './dto/remove-currency.dto';
import { Repository } from 'typeorm';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    @InjectRepository(CurrencyPairEntity)
    private readonly currencyPairRepository: Repository<CurrencyPairEntity>,
  ) {}

  async create(createCurrencyDto: CreateCurrencyDto): Promise<CurrencyEntity> {
    // Check if a currency with the same code already exists
    const existingCurrency = await this.currencyRepository.findOne({
      where: { code: createCurrencyDto.code },
    });
    if (existingCurrency) {
      throw new UnprocessableEntityException({
        status: HttpStatus.NOT_ACCEPTABLE,
        errors: {
          status: 'currency code already exist',
        },
      });
    }
    const currency = this.currencyRepository.create(createCurrencyDto);
    return this.currencyRepository.save(currency);
  }

  async findAll(): Promise<CurrencyEntity[]> {
    return this.currencyRepository.find();
  }

  async findOne(
    getCurrencyDto: GetCurrencyDto,
  ): Promise<CurrencyEntity | null> {
    return this.currencyRepository.findOne({
      where: { id: getCurrencyDto.id },
    });
  }

  async update(
    updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<CurrencyEntity | null> {
    const { id, ...updateData } = updateCurrencyDto;
    await this.currencyRepository.update(id, updateData);
    return this.currencyRepository.findOne({ where: { id } });
  }

  async remove(removeCurrencyDto: RemoveCurrencyDto): Promise<void> {
    const { id } = removeCurrencyDto;

    // Check if the currency is referenced in currency_pairs
    const referencedPairs = await this.currencyPairRepository.find({
      where: [{ baseCurrencyId: { id } }, { targetCurrencyId: { id } }],
    });

    if (referencedPairs.length > 0) {
      throw new ConflictException(
        'Currency is referenced in currency pairs and cannot be deleted',
      );
    }

    const result = await this.currencyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Currency with ID ${id} not found`);
    }
  }
}
