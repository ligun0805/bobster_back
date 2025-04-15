import {
  Body,
  Param,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Patch,
  Delete,
  SerializeOptions,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthLoginDto } from './dto/auth-login.dto';
// import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
// import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
// import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { NullableType } from '../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { SettingUpdateDto } from './dto/auth-setting-update.dto';
import { AuthEmailRegisterLoginDto } from './dto/auth-email-register.dto';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthCreateRefererDto } from './dto/auth-create-referer.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  public login(
    @Body() loginDto: AuthLoginDto,
  ): Promise<NullableType<LoginResponseDto>> {
    return this.service.validateLogin(loginDto);
  }

  // @Post('register')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async register(
  //   @Body() createUserDto: AuthRegisterLoginDto,
  //   refererId: number,
  // ): Promise<void> {
  //   console.log(createUserDto);
  //   return await this.service.register(createUserDto, refererId);
  // }

  @Post('admin/login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  public adminLogin(
    @Body() loginDto: AuthEmailRegisterLoginDto,
  ): Promise<NullableType<LoginResponseDto>> {
    return this.service.adminLogin(loginDto);
  }

  @ApiBearerAuth()
  @Post('admin/register')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminRegister(
    @Body() createAdminDto: AuthEmailRegisterLoginDto,
  ): Promise<void> {
    return await this.service.adminRegister(createAdminDto);
  }

  // @ApiBearerAuth()
  @Post('admin/createReferer')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(RoleEnum.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async createReferer(
    @Body() tgUserNameDto: AuthCreateRefererDto,
  ): Promise<void> {
    const createRefererDto = new AuthRegisterLoginDto();
    createRefererDto.tgId = '999';
    createRefererDto.tgUserName = tgUserNameDto.tgUserName;
    createRefererDto.role = createRefererDto.role || {};
    createRefererDto.role.id = RoleEnum.referer;
    return await this.service.register(createRefererDto, 1);
  }

  // @Post('email/confirm')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async confirmEmail(
  //   @Body() confirmEmailDto: AuthConfirmEmailDto,
  // ): Promise<void> {
  //   return this.service.confirmEmail(confirmEmailDto.hash);
  // }

  // @Post('email/confirm/new')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async confirmNewEmail(
  //   @Body() confirmEmailDto: AuthConfirmEmailDto,
  // ): Promise<void> {
  //   return this.service.confirmNewEmail(confirmEmailDto.hash);
  // }

  // @Post('forgot/password')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async forgotPassword(
  //   @Body() forgotPasswordDto: AuthForgotPasswordDto,
  // ): Promise<void> {
  //   return this.service.forgotPassword(forgotPasswordDto.email);
  // }

  // @Post('reset/password')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
  //   return this.service.resetPassword(
  //     resetPasswordDto.hash,
  //     resetPasswordDto.password,
  //   );
  // }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<NullableType<User>> {
    return this.service.me(request.user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<RefreshResponseDto> {
    return this.service.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
  })
  public update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    return this.service.update(request.user, userDto);
  }

  @ApiBearerAuth()
  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Request() request): Promise<void> {
    return this.service.softDelete(request.user);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('me/setting')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
  })
  public updateSetting(
    @Request() request,
    @Body() settingDto: SettingUpdateDto,
  ): Promise<NullableType<User>> {
    return this.service.updateSetting(request.user.id, settingDto);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('me/addGuarantee/:amount')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
  })
  public addGuarantee(
    @Request() request,
    @Param('amount') amount: number,
  ): Promise<NullableType<User>> {
    return this.service.addGuarantee(request.user.id, amount);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('me/takeFund/:amount')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
  })
  public takeFund(
    @Request() request,
    @Param('amount') amount: number,
  ): Promise<NullableType<User>> {
    return this.service.takeFund(request.user.id, amount);
  }
}
