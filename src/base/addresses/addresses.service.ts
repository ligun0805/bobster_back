import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { AddressEntity } from './infrastructure/address.entity';
import { UserEntity } from '../../users/infrastructure/entities/user.entity';
import { RoleEnum } from '../../roles/roles.enum';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createCountry(countryName: string): Promise<AddressEntity> {
    const result = await this.addressRepository.findOne({
      where: { country: countryName },
    });
    if (result) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Same country exists',
        },
      });
    }
    const address = this.addressRepository.create({
      country: countryName,
    });
    return this.addressRepository.save(address);
  }

  async createCity(countryId: number, city: string): Promise<AddressEntity> {
    const countryResult = await this.addressRepository.findOne({
      where: { id: countryId },
    });
    if (!countryResult) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Country does not exist',
        },
      });
    }
    const resultCountryId = countryResult.id;
    const cityResult = await this.addressRepository.findOne({
      where: { country: resultCountryId.toString(), city: city },
    });
    if (cityResult) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Same City exists',
        },
      });
    }
    const address = this.addressRepository.create({
      country: resultCountryId.toString(),
      city: city,
    });
    return this.addressRepository.save(address);
  }

  async createStreet(
    cityId: number,
    street: string,
    userId: number,
    currencyId: number,
  ): Promise<AddressEntity> {
    const cityResult = await this.addressRepository.findOne({
      where: { id: cityId },
    });
    if (!cityResult) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'City does not exist',
        },
      });
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user || !user.role) {
      throw new NotFoundException('User not found or has no role');
    }
    if (user.role.id !== RoleEnum.trader2) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Only Trader 2 can have addresses',
        },
      });
    }

    const resultCountryId = cityResult.country;
    const cityName = cityResult.city;
    const countryName = await this.addressRepository.findOne({
      where: { id: Number(resultCountryId) },
    });

    const streetResult = await this.addressRepository.findOne({
      where: {
        country: resultCountryId,
        city: cityId.toString(),
        street: street,
      },
    });
    if (streetResult) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Same street exists',
        },
      });
    }

    const address = this.addressRepository.create({
      country: resultCountryId,
      city: cityId.toString(),
      street: street,
      fullAddress: `${countryName?.country}, ${cityName}, ${street}`,
      user: { id: userId },
      currency: { id: currencyId },
    });
    return this.addressRepository.save(address);
  }

  async getCountries(): Promise<AddressEntity[]> {
    return await this.addressRepository.find({
      where: { city: IsNull(), street: IsNull() },
    });
  }

  async getCities(countryId: number): Promise<AddressEntity[]> {
    return await this.addressRepository.find({
      where: { country: countryId.toString(), street: IsNull() },
    });
  }

  async getStreets(cityId: number): Promise<AddressEntity[]> {
    return await this.addressRepository.find({
      where: { city: cityId.toString() },
    });
  }

  async updateCountry(addressId: number, newCountry: string): Promise<void> {
    await this.addressRepository.update(addressId, {
      country: newCountry,
    });
  }

  async updateCity(addressId: number, newCity: string): Promise<void> {
    await this.addressRepository.update(addressId, {
      city: newCity,
    });
  }

  async updateStreet(addressId: number, newStreet: string): Promise<void> {
    const nowAddress = await this.addressRepository.findOne({
      where: { id: addressId },
    });

    if (!nowAddress) return;
    const countryId = Number(nowAddress.country);
    const cityId = Number(nowAddress.city);
    if (!countryId || !cityId) return;
    const country = await this.addressRepository.findOne({
      where: { id: countryId },
    });
    const city = await this.addressRepository.findOne({
      where: { id: cityId },
    });
    if (!country || !city) return;
    await this.addressRepository.update(addressId, {
      street: newStreet,
      fullAddress: `${country.country}, ${city.city}, ${newStreet}`,
    });
  }

  async deleteCountry(id: number): Promise<void> {
    await this.addressRepository.delete(id);
    await this.addressRepository.delete({ country: id.toString() });
  }

  async deleteCity(id: number): Promise<void> {
    await this.addressRepository.delete(id);
    await this.addressRepository.delete({ city: id.toString() });
  }

  async deleteStreet(id: number): Promise<void> {
    await this.addressRepository.delete(id);
  }

  async getAddresses(): Promise<AddressEntity[]> {
    return await this.addressRepository.find({
      where: { user: Not(IsNull()) } as FindOptionsWhere<AddressEntity>,
      relations: ['user', 'user.myCurrency', 'currency'],
    });
  }

  async getUserAddresses(userId: number): Promise<AddressEntity[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user || !user.role) {
      throw new NotFoundException('User not found or has no role');
    }

    if (user.role.id !== RoleEnum.trader2) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Only Trader 2 can have addresses',
        },
      });
    }

    return this.addressRepository.find({
      where: { user: { id: userId } },
    });
  }
}
