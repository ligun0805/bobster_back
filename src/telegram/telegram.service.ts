import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { StatusEnum } from '../statuses/statuses.enum';
import { BOT_MESSAGES } from './telegram.messages';
import { ReferralCodeService } from '../referralcodes/referralcodes.service';
import { FeeScheduleEntity } from '../base/feeSchedule/infrastructure/feeSchedules.entity';
import { Repository } from 'typeorm';
import { RoleEnum } from '../roles/roles.enum';
import { LessThan } from 'typeorm';
import { BlockTgUserIdsService } from '../base/blockTgUserId/blockTgUserIds.service';

@Injectable()
export class TelegramService {
  private user;
  private referralCode;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly referralCodeService: ReferralCodeService,
    private readonly blockTgUserIdService: BlockTgUserIdsService,
    @InjectRepository(FeeScheduleEntity)
    private readonly feeScheduleRepository: Repository<FeeScheduleEntity>,
  ) {}

  async getFirstResponse(
    tgUserId: string,
    tgUserName: string,
  ): Promise<string> {
    this.user = await this.usersService.findByTel_userId(tgUserId);
    if (this.user)
      if (this.user?.status?.id == StatusEnum.blocked)
        return BOT_MESSAGES.USER_ACCOUNT_BLOCKED;
      else {
        if (this.user.fee == null && this.user.role.id == RoleEnum.referer) {
          const refererDefaultFee = (
            await this.feeScheduleRepository.find({
              where: {
                userId: 0,
                userType: RoleEnum.referer,
                fromDate: LessThan(new Date()),
              },
            })
          ).at(0)?.fee;
          this.user.fee = refererDefaultFee;
          await this.usersService.update(this.user.id, this.user);
        } else if (
          this.user.fee == null &&
          this.user.role.id == RoleEnum.trader2
        ) {
          const refererDefaultFee = (
            await this.feeScheduleRepository.find({
              where: {
                userId: 0,
                userType: RoleEnum.trader2,
                fromDate: LessThan(new Date()),
              },
            })
          ).at(0)?.fee;
          this.user.fee = refererDefaultFee;
          await this.usersService.update(this.user.id, this.user);
        }
        return await this.validLogin(tgUserId);
      }
    else {
      this.user = await this.usersService.findByTel_userName(tgUserName);
      if (this.user) {
        if (this.user.fee == null && this.user.role.id == RoleEnum.referer) {
          const refererDefaultFee = (
            await this.feeScheduleRepository.find({
              where: {
                userId: 0,
                userType: RoleEnum.referer,
                fromDate: LessThan(new Date()),
              },
            })
          ).at(0)?.fee;
          this.user.fee = refererDefaultFee;
          this.user.tgId = tgUserId;
          await this.usersService.update(this.user.id, this.user);
        } else if (
          this.user.fee == null &&
          this.user.role.id == RoleEnum.trader2
        ) {
          const refererDefaultFee = (
            await this.feeScheduleRepository.find({
              where: {
                userId: 0,
                userType: RoleEnum.trader2,
                fromDate: LessThan(new Date()),
              },
            })
          ).at(0)?.fee;
          this.user.fee = refererDefaultFee;
          this.user.tgId = tgUserId;
          await this.usersService.update(this.user.id, this.user);
        }
        return await this.validLogin(tgUserId);
      } else return await this.getAttemptByTgId(tgUserId);
    }
  }

  async getResponse(
    tgUserId: string,
    userName: string,
    tgUserName: string,
    referralCode: string,
    botUserName: string,
  ): Promise<string> {
    this.user = await this.usersService.findByTel_userId(tgUserId);

    if (this.user) {
      if (this.user?.status?.id == StatusEnum.blocked)
        return BOT_MESSAGES.USER_ACCOUNT_BLOCKED;
      else if (
        this.user.roleId == RoleEnum.customer &&
        botUserName == 'bobster_client_dev_bot'
      )
        return await this.validLogin(tgUserId);
      else if (
        this.user.roleId == RoleEnum.referer &&
        botUserName == 'bobster_dev_bot'
      )
        return await this.validLogin(tgUserId);
      else if (
        this.user.roleId == RoleEnum.trader &&
        botUserName == 'bobster_trader_1_dev_bot'
      )
        return await this.validLogin(tgUserId);
      else if (
        this.user.roleId == RoleEnum.trader2 &&
        botUserName == 'bobster_trader_2_dev_bot'
      )
        return await this.validLogin(tgUserId);
      else {
        return BOT_MESSAGES.WRONG_SELECT_BOT;
      }
    }
    if (!this.isValidUUID(referralCode))
      return await this.blockTgUserIdService.handleLoginAttempt(
        tgUserId,
        false,
      );
    this.referralCode = await this.referralCodeService.findByCode(referralCode);
    if (!this.referralCode) {
      return await this.blockTgUserIdService.handleLoginAttempt(
        tgUserId,
        false,
      );
    } else {
      if (
        (this.referralCode.roleId == RoleEnum.customer &&
          botUserName == 'bobster_client_dev_bot') ||
        (this.referralCode.roleId == RoleEnum.referer &&
          botUserName == 'bobster_dev_bot') ||
        (this.referralCode.roleId == RoleEnum.trader &&
          botUserName == 'bobster_trader_1_dev_bot') ||
        (this.referralCode.roleId == RoleEnum.trader2 &&
          botUserName == 'bobster_trader_2_dev_bot')
      ) {
        await this.blockTgUserIdService.handleLoginAttempt(tgUserId, true);

        if (this.referralCode.roleId == RoleEnum.trader) {
          this.referralCode.defaultFee = (
            await this.feeScheduleRepository.find({
              where: {
                userId: 0,
                userType: RoleEnum.trader,
                fromDate: LessThan(new Date()),
              },
            })
          ).at(0)?.fee;
        } else if (this.referralCode.roleId == RoleEnum.trader2) {
          this.referralCode.defaultFee = (
            await this.feeScheduleRepository.find({
              where: {
                userId: 0,
                userType: RoleEnum.trader2,
                fromDate: LessThan(new Date()),
              },
            })
          ).at(0)?.fee;
        } else if (this.referralCode.roleId == RoleEnum.referer) {
          this.referralCode.defaultFee = (
            await this.feeScheduleRepository.find({
              where: {
                userId: 0,
                userType: RoleEnum.referer,
                fromDate: LessThan(new Date()),
              },
            })
          ).at(0)?.fee;
        }
        const user = {
          userName: userName,
          tgUserName: tgUserName,
          tgId: tgUserId,
          referralAmount: 0,
          referralCode: {
            id: this.referralCode.id,
            refererId: this.referralCode.refererId,
            roleId: this.referralCode.roleId,
          },
          role: {
            id: this.referralCode.roleId,
          },
          fee: this.referralCode.defaultFee,
        };
        await this.authService.register(user, this.referralCode.refererId);
        return await this.validLogin(user.tgId);
      } else {
        return BOT_MESSAGES.WRONG_SELECT_BOT;
      }
    }
  }
  async getAttemptByTgId(tgId: string): Promise<string> {
    const attempts = await this.blockTgUserIdService.getAttemptByTgId(tgId);
    if (attempts >= 5) return BOT_MESSAGES.USER_ACCOUNT_BLOCKED;
    else return BOT_MESSAGES.NEW_USER_GREETING;
  }

  isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  async validLogin(user_tgId: string): Promise<string> {
    console.log('tgIDDDDDDDDDDDDDDDD', user_tgId);
    const loginResponse = await this.authService.validateLogin({
      tgId: user_tgId,
    });
    if (!loginResponse) return BOT_MESSAGES.SERVER_ERROR;
    const token = loginResponse.token;
    const refreshToken = loginResponse.refreshToken;
    const tokenExpires = loginResponse.tokenExpires;
    const kycDataUploaded =
      loginResponse.user.photo && loginResponse.user.userName ? true : false;
    const access_data =
      '?token=' +
      token +
      '&refresh_token=' +
      refreshToken +
      '&token_expires=' +
      tokenExpires +
      '&kycDataUploaded=' +
      kycDataUploaded;
    return BOT_MESSAGES.REFERRALCODE_ACCEPTED + access_data;
  }
}
