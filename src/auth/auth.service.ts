import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import ms from 'ms';
import crypto from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { NullableType } from '../utils/types/nullable.type';
import { LoginResponseDto } from './dto/login-response.dto';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { UsersService } from '../users/users.service';
import { AllConfigType } from '../config/config.type';
import { MailService } from '../mail/mail.service';
import { Session } from '../session/domain/session';
import { SessionService } from '../session/session.service';
import { StatusEnum } from '../statuses/statuses.enum';
import { User } from '../users/domain/user';
import { SettingUpdateDto } from './dto/auth-setting-update.dto';
import { CurrencyEntity } from '../base/currencies/infrastructure/currency.entity';
import { LanguageEntity } from '../base/languages/infrastructure/language.entity';
import { RoleEnum } from '../roles/roles.enum';
import { AuthEmailRegisterLoginDto } from './dto/auth-email-register.dto';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private sessionService: SessionService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>,
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    @InjectRepository(LanguageEntity)
    private readonly languageRepository: Repository<LanguageEntity>,
  ) {}

  async validateLogin(
    loginDto: AuthLoginDto,
  ): Promise<NullableType<LoginResponseDto>> {
    const user = await this.usersService.findByTel_userId(loginDto.tgId);

    if (user) {
      const hash = crypto
        .createHash('sha256')
        .update(randomStringGenerator())
        .digest('hex');

      const session = await this.sessionService.create({
        user,
        hash,
      });
      const { token, refreshToken, tokenExpires } = await this.getTokensData({
        id: user.id,
        role: user.role,
        sessionId: session.id,
        hash,
      });

      return {
        refreshToken,
        token,
        tokenExpires,
        user,
      };
    }
    return null;
  }

  async adminLogin(
    loginDto: AuthEmailRegisterLoginDto,
  ): Promise<NullableType<LoginResponseDto>> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'notFound',
        },
      });
    }
    if (!user.tgId) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      });
    }

    const isValidPassword = await bcrypt.compare(loginDto.password, user.tgId);

    if (!isValidPassword) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      });
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({
      user,
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
      hash,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async register(dto: AuthRegisterLoginDto, refererId: number): Promise<void> {
    await this.usersService.create({
      ...dto,
      status: {
        id: StatusEnum.active,
      },
      tradeType: 1,
      currentBalance: 0,
      processingBalance: 0,
      wallet: '',
    });
    await this.usersService.incrementReferralAmount(refererId);
  }

  async adminRegister(dto: AuthEmailRegisterLoginDto): Promise<void> {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(dto.password, salt);
    dto.password = password;
    await this.usersService.createAdmin({
      ...dto,
    });
    // const hash = await this.jwtService.signAsync(
    //   {
    //     confirmEmailUserId: userId,
    //   },
    //   {
    //     secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
    //       infer: true,
    //     }),
    //     expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
    //       infer: true,
    //     }),
    //   },
    // );

    // await this.mailService.userSignUp({
    //   to: dto.email,
    //   data: {
    //     hash,
    //   },
    // });
  }

  async getUserIdFromToken(token: string): Promise<number> {
    try {
      const secret = this.configService.getOrThrow('auth.secret', {
        infer: true,
      });
      const payload = await this.jwtService.verifyAsync<JwtPayloadType>(token, {
        secret,
      });
      return payload.id;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
  async confirmEmail(hash: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userId = jwtData.confirmEmailUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.usersService.findById(userId);

    if (
      !user ||
      user?.status?.id?.toString() !== StatusEnum.inactive.toString()
    ) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      });
    }

    user.status = {
      id: StatusEnum.active,
    };

    await this.usersService.update(user.id, user);
  }

  // async confirmNewEmail(hash: string): Promise<void> {
  //   let userId: User['id'];
  //   let newEmail: User['email'];

  //   try {
  //     const jwtData = await this.jwtService.verifyAsync<{
  //       confirmEmailUserId: User['id'];
  //       newEmail: User['email'];
  //     }>(hash, {
  //       secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
  //         infer: true,
  //       }),
  //     });

  //     userId = jwtData.confirmEmailUserId;
  //     newEmail = jwtData.newEmail;
  //   } catch {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         hash: `invalidHash`,
  //       },
  //     });
  //   }

  //   const user = await this.usersService.findById(userId);

  //   if (!user) {
  //     throw new NotFoundException({
  //       status: HttpStatus.NOT_FOUND,
  //       error: `notFound`,
  //     });
  //   }

  //   user.email = newEmail;
  //   user.status = {
  //     id: StatusEnum.active,
  //   };

  //   await this.usersService.update(user.id, user);
  // }

  // async forgotPassword(email: string): Promise<void> {
  //   const user = await this.usersService.findByEmail(email);

  //   if (!user) {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         email: 'emailNotExists',
  //       },
  //     });
  //   }

  //   const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
  //     infer: true,
  //   });

  //   const tokenExpires = Date.now() + ms(tokenExpiresIn);

  //   const hash = await this.jwtService.signAsync(
  //     {
  //       forgotUserId: user.id,
  //     },
  //     {
  //       secret: this.configService.getOrThrow('auth.forgotSecret', {
  //         infer: true,
  //       }),
  //       expiresIn: tokenExpiresIn,
  //     },
  //   );

  //   await this.mailService.forgotPassword({
  //     to: email,
  //     data: {
  //       hash,
  //       tokenExpires,
  //     },
  //   });
  // }

  // async resetPassword(hash: string, password: string): Promise<void> {
  //   let userId: User['id'];

  //   try {
  //     const jwtData = await this.jwtService.verifyAsync<{
  //       forgotUserId: User['id'];
  //     }>(hash, {
  //       secret: this.configService.getOrThrow('auth.forgotSecret', {
  //         infer: true,
  //       }),
  //     });

  //     userId = jwtData.forgotUserId;
  //   } catch {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         hash: `invalidHash`,
  //       },
  //     });
  //   }

  //   const user = await this.usersService.findById(userId);

  //   if (!user) {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         hash: `notFound`,
  //       },
  //     });
  //   }

  //   user.password = password;

  //   await this.sessionService.deleteByUserId({
  //     userId: user.id,
  //   });

  //   await this.usersService.update(user.id, user);
  // }

  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.usersService.findById(userJwtPayload.id);
  }

  async update(
    userJwtPayload: JwtPayloadType,
    userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    const currentUser = await this.usersService.findById(userJwtPayload.id);

    if (!currentUser) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }

    delete userDto.oldPassword;

    await this.usersService.update(userJwtPayload.id, userDto);

    return this.usersService.findById(userJwtPayload.id);
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    const session = await this.sessionService.findById(data.sessionId);

    if (!session) {
      throw new UnauthorizedException();
    }

    if (session.hash !== data.hash) {
      throw new UnauthorizedException();
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const user = await this.usersService.findById(session.user.id);

    if (!user?.role) {
      throw new UnauthorizedException();
    }

    await this.sessionService.update(session.id, {
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.user.id,
      role: {
        id: user.role.id,
      },
      sessionId: session.id,
      hash,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async softDelete(user: User): Promise<void> {
    await this.usersService.remove(user.id);
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.deleteById(data.sessionId);
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
    hash: Session['hash'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async updateSetting(
    userId: number,
    SettingDto: SettingUpdateDto,
  ): Promise<NullableType<User>> {
    const language = await this.languageRepository.findOne({
      where: { id: SettingDto.languageId },
    });
    const myCurrency = await this.currencyRepository.findOne({
      where: { id: SettingDto.myCurrencyId },
    });
    const receiverCurrency = await this.currencyRepository.findOne({
      where: { id: SettingDto.receiverCurrencyId },
    });

    if (!language || !myCurrency || !receiverCurrency) return null;

    return await this.usersService.update(userId, {
      language: language,
      myCurrency: myCurrency,
      receiverCurrency: receiverCurrency,
    });
  }

  async addGuarantee(
    userId: number,
    amount: number,
  ): Promise<NullableType<User>> {
    const user = await this.usersService.findById(userId);
    if (!user || user.role?.id != RoleEnum.trader) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Such a trader not exist',
        },
      });
    }

    const newBalance = parseFloat(user.currentBalance.toString()) + amount;

    return await this.usersService.update(userId, {
      currentBalance: newBalance,
    });
  }

  async takeFund(userId: number, amount: number): Promise<NullableType<User>> {
    const user = await this.usersService.findById(userId);
    if (!user || user.role?.id != RoleEnum.trader) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Such a trader not exist',
        },
      });
    }

    const newBalance = parseFloat(user.currentBalance.toString()) - amount;

    return await this.usersService.update(userId, {
      currentBalance: newBalance,
    });
  }
}
