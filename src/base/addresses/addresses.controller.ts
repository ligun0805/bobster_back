import {
  Controller,
  Post,
  Delete,
  Get,
  Query,
  Request,
  UseGuards,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { AddressEntity } from './infrastructure/address.entity';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../roles/roles.decorator';
import { RoleEnum } from '../../roles/roles.enum';

@ApiTags('Addresses')
@Controller({
  path: 'addresses',
  version: '1',
})
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  async getAddresses(): Promise<AddressEntity[]> {
    return this.addressesService.getAddresses();
  }

  @Post('/country')
  async createCountry(
    @Query('country') country: string,
  ): Promise<AddressEntity> {
    return this.addressesService.createCountry(country);
  }

  @Post('/city')
  async createCity(
    @Query('countryId') countryId: number,
    @Query('city') city: string,
  ): Promise<AddressEntity> {
    return this.addressesService.createCity(countryId, city);
  }

  @Post('/street')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Roles(RoleEnum.trader2)
  async createStreet(
    @Request() request,
    @Query('cityId') cityId: number,
    @Query('street') street: string,
    @Query('currencyId') currencyId: number,
  ): Promise<AddressEntity> {
    return this.addressesService.createStreet(
      cityId,
      street,
      request.user.id,
      currencyId,
    );
  }

  @Get('/countries')
  async getCountries(): Promise<AddressEntity[]> {
    return this.addressesService.getCountries();
  }

  @Get('/cities')
  async getCities(
    @Query('countryId') countryId: number,
  ): Promise<AddressEntity[]> {
    return this.addressesService.getCities(countryId);
  }

  @Get('/streets')
  async getStreets(@Query('cityId') cityId: number): Promise<AddressEntity[]> {
    return this.addressesService.getStreets(cityId);
  }

  @Patch('/country')
  async updateCountry(
    @Query('id') addressId: number,
    @Query('newCity') newCountry: string,
  ): Promise<void> {
    return this.addressesService.updateCountry(addressId, newCountry);
  }

  @Patch('/city')
  async updateCity(
    @Query('id') addressId: number,
    @Query('newCity') newCity: string,
  ): Promise<void> {
    return this.addressesService.updateCity(addressId, newCity);
  }

  @Patch('/street')
  async updateStreet(
    @Query('id') addressId: number,
    @Query('newStreet') newStreet: string,
  ): Promise<void> {
    return this.addressesService.updateStreet(addressId, newStreet);
  }

  @Delete('/country')
  async deleteCountry(@Query('id') addressId: number): Promise<void> {
    return this.addressesService.deleteCountry(addressId);
  }

  @Delete('/city')
  async deleteCity(@Query('id') addressId: number): Promise<void> {
    return this.addressesService.deleteCity(addressId);
  }

  @Delete('/street')
  async deleteStreet(@Query('id') addressId: number): Promise<void> {
    return this.addressesService.deleteStreet(addressId);
  }

  @ApiOkResponse({
    type: [AddressEntity],
  })
  @Get('/user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserAddresses(
    @Param('userId') userId: number,
  ): Promise<AddressEntity[]> {
    const addresses = await this.addressesService.getUserAddresses(userId);
    if (!addresses.length)
      throw new NotFoundException('No addresses found for this user');
    return addresses;
  }
}
