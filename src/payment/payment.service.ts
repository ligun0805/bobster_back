import {
  Injectable,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from './infrastructure/payment.entity';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { CurrencyEntity } from '../base/currencies/infrastructure/currency.entity';
import { CreateDepositDto, CreateWithdrawDto } from './dto/create-payment.dto';
import { PaymentStatusEnum } from './payment.enum';
import { SortPaymentDto } from './dto/query-payment.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { PaymentIdDto } from './dto/confirm-payment.dto';
import { AppGateway } from '../chat/chats.gateway';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    @InjectBot('customerBot') private readonly customerBot: Telegraf<any>,

    private readonly appGateWay: AppGateway,
  ) {}

  async deposit(depositDto: CreateDepositDto): Promise<PaymentEntity | null> {
    const user = await this.userRepository.findOne({
      where: { id: depositDto.user_id },
    });

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'userNotExists',
        },
      });
    }

    const deposit = this.paymentRepository.create({
      ...depositDto,
      user,
      status: PaymentStatusEnum.DEPOSIT_PENDING,
    });

    return this.paymentRepository.save(deposit);
  }

  async findDepositData({
    sortOptions,
    paginationOptions,
  }: {
    sortOptions?: SortPaymentDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaymentEntity[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .where('payment.status IN (:...statuses)', { statuses: [1, 2] });

    if (sortOptions?.length) {
      for (let i = 0; i < sortOptions.length; i++) {
        if (sortOptions[i].order && sortOptions[i].orderBy)
          queryBuilder.addOrderBy(
            `payment.${sortOptions[i].orderBy}`,
            sortOptions[i].order,
          );
      }
    }

    return queryBuilder.getMany();
  }

  async confirmDeposit(paymentIdDto: PaymentIdDto): Promise<PaymentEntity> {
    const deposit = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .where('payment.id = :paymentId', { paymentId: paymentIdDto.paymentId })
      .getOne();

    if (!deposit) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'deposit data is not exist!!!',
        },
      });
    } else if (deposit.status === PaymentStatusEnum.DEPOSIT_CONFIRMED) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The data is already confirmed!!!',
        },
      });
    } else if (deposit.status === PaymentStatusEnum.DEPOSIT_REJECTED) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The data is already rejected!!!',
        },
      });
    }
    const user = await this.userRepository.findOne({
      where: { id: deposit.userId },
    });
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The user is not exist!!!',
        },
      });
    }
    user.currentBalance =
      user.currentBalance === null ? 0 : user.currentBalance;
    user.currentBalance = Number(deposit.amount) + Number(user.currentBalance);
    await this.userRepository.save(user);

    deposit.status = PaymentStatusEnum.DEPOSIT_CONFIRMED;
    deposit.user = user;
    return this.paymentRepository.save(deposit);
  }

  async rejectDeposit(paymentIdDto: PaymentIdDto): Promise<PaymentEntity> {
    const deposit = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .where('payment.id = :paymentId', { paymentId: paymentIdDto.paymentId })
      .getOne();

    if (!deposit) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'deposit data is not exist!!!',
        },
      });
    } else if (deposit.status === PaymentStatusEnum.DEPOSIT_CONFIRMED) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The data is already confirmed!!!',
        },
      });
    } else if (deposit.status === PaymentStatusEnum.DEPOSIT_REJECTED) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The data is already rejected!!!',
        },
      });
    }

    const user = await this.userRepository.findOne({
      where: { id: deposit.userId },
    });
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The user is not exist!!!',
        },
      });
    }

    deposit.status = PaymentStatusEnum.DEPOSIT_REJECTED;
    await this.appGateWay.sendNotificationToUser(user.id, {
      title: 'Deposit rejected',
      content: `Deposit ${deposit.id} rejected`,
      from: `Admin`,
    });
    await this.customerBot.telegram.sendMessage(
      user.tgId,
      `Your deposit is rejected(${deposit.id})!!!`,
    );
    return this.paymentRepository.save(deposit);
  }

  async withdraw(
    withdrawDto: CreateWithdrawDto,
  ): Promise<PaymentEntity | null> {
    const user = await this.userRepository.findOne({
      where: { id: withdrawDto.user_id },
    });

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'userNotExists',
        },
      });
    }

    const withdraw = this.paymentRepository.create({
      ...withdrawDto,
      user,
      status: PaymentStatusEnum.WITHDRAW_PENDING,
    });

    return this.paymentRepository.save(withdraw);
  }

  async findWithDrawData({
    sortOptions,
    paginationOptions,
  }: {
    sortOptions?: SortPaymentDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaymentEntity[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .where('payment.status IN (:...statuses)', { statuses: [3, 4] });

    if (sortOptions?.length) {
      for (let i = 0; i < sortOptions.length; i++) {
        if (sortOptions[i].order && sortOptions[i].orderBy)
          queryBuilder.addOrderBy(
            `payment.${sortOptions[i].orderBy}`,
            sortOptions[i].order,
          );
      }
    }

    return queryBuilder.getMany();
  }

  async confirmWithdraw(paymentIdDto: PaymentIdDto): Promise<PaymentEntity> {
    const withdraw = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .where('payment.id = :paymentId', { paymentId: paymentIdDto.paymentId })
      .getOne();

    if (!withdraw) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'withdraw data is not exist!!!',
        },
      });
    } else if (withdraw.status === PaymentStatusEnum.WITHDRAW_CONFIRMED) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The data is already confirmed!!!',
        },
      });
    } else if (withdraw.status === PaymentStatusEnum.WITHDRAW_REJECTED) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The data is already rejected!!!',
        },
      });
    }

    const user = await this.userRepository.findOne({
      where: { id: withdraw.userId },
    });
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The user is not exist!!!',
        },
      });
    }

    if (
      user.currentBalance === null ||
      Number(user.currentBalance) < Number(withdraw.amount)
    ) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Your Balance is not enough!!!',
        },
      });
    }
    user.currentBalance = Number(user.currentBalance) - Number(withdraw.amount);
    await this.userRepository.save(user);

    withdraw.status = PaymentStatusEnum.WITHDRAW_CONFIRMED;
    withdraw.user = user;
    return this.paymentRepository.save(withdraw);
  }

  async rejectWithdraw(paymentIdDto: PaymentIdDto): Promise<PaymentEntity> {
    const withdraw = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .where('payment.id = :paymentId', { paymentId: paymentIdDto.paymentId })
      .getOne();

    if (!withdraw) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'withdraw data is not exist!!!',
        },
      });
    } else if (withdraw.status === PaymentStatusEnum.WITHDRAW_CONFIRMED) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The data is already confirmed!!!',
        },
      });
    } else if (withdraw.status === PaymentStatusEnum.WITHDRAW_REJECTED) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The data is already rejected!!!',
        },
      });
    }

    const user = await this.userRepository.findOne({
      where: { id: withdraw.userId },
    });
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The user is not exist!!!',
        },
      });
    }

    withdraw.status = PaymentStatusEnum.WITHDRAW_REJECTED;

    await this.appGateWay.sendNotificationToUser(user.id, {
      title: 'Withdraw rejected',
      content: `Withdraw ${withdraw.id} rejected`,
      from: `Admin`,
    });
    await this.customerBot.telegram.sendMessage(
      user.tgId,
      `Your withdraw is rejected(${withdraw.id})!!!`,
    );
    return this.paymentRepository.save(withdraw);
  }

  async findById(
    paymentId: string,
  ): Promise<PaymentEntity & { tx_status: boolean }> {
    const data = await this.paymentRepository.findOne({
      where: {
        id: Number(paymentId),
      },
      relations: ['user'],
    });

    const {
      data: { success: txStatus },
    } = await axios.get(
      `https://tonapi.io/v2/blockchain/transactions/${data?.tx_hash}`,
    );

    if (!data) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'The data not found',
        },
      });
    }

    return { ...data, tx_status: txStatus };
  }
}
