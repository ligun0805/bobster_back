import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Body,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReferralCodeService } from './referralcodes.service';
import { ReferralCodesRegisterLoginDto } from './dto/referralcodes-register-login.dto';
import { ReferralCodesTraderRegisterLoginDto } from './dto/referralcodes-trader2-register.dto';
import { ReferralCode } from './domain/referralcode';
import { AuthGuard } from '@nestjs/passport';
import { RoleEnum } from '../roles/roles.enum';

@ApiTags('ReferralCode')
@Controller({
  path: 'referralcodes',
  version: '1',
})
export class ReferralcodesController {
  constructor(private readonly referralCodeService: ReferralCodeService) {}

  @Post('/createTrader2')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(RoleEnum.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async createTrader2(
    @Body() trader2NameDto: ReferralCodesTraderRegisterLoginDto,
  ): Promise<void> {
    const createRefererDto = new ReferralCodesRegisterLoginDto();

    createRefererDto.tgId = '999';
    createRefererDto.tgUserName = trader2NameDto.tgUserName;
    createRefererDto.role = createRefererDto.role || {};
    createRefererDto.role.id = RoleEnum.trader2;
    return await this.referralCodeService.register(createRefererDto, 1);
  }

  @Post('/createReferer')
  async createReferer(): Promise<ReferralCode> {
    return await this.referralCodeService.createReferer();
  }

  @Post('/createTrader2Code')
  async createTrader2Code(): Promise<ReferralCode> {
    return await this.referralCodeService.createTrader2();
  }

  @Get('/getCustomerReferralCode')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getCustomerReferralCode(@Request() request) {
    const userId = request.user.id;
    return await this.referralCodeService.getReferralCode(
      userId,
      RoleEnum.customer,
    );
  }

  @Get('/getTraderReferralCode')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getTraderReferralCode(@Request() request) {
    const userId = request.user.id;
    return await this.referralCodeService.getReferralCode(
      userId,
      RoleEnum.trader,
    );
  }
  @Get('/getTrader2ReferralCode')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getTrader2ReferralCode(@Request() request) {
    const userId = request.user.id;
    return await this.referralCodeService.getReferralCode(
      userId,
      RoleEnum.trader2,
    );
  }
}
