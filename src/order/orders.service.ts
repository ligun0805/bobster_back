// src/orders/order.service.ts
import {
  Injectable,
  UnprocessableEntityException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, Repository, In, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './infrastructure/order.entity';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { User } from '../users/domain/user';
import { CurrencyEntity } from '../base/currencies/infrastructure/currency.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { RoleEnum } from '../roles/roles.enum';
import { OrderStatusEnum } from './order.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { FilterOrderDto, SortOrderDto } from './dto/query-order.dto';
import { PaymentMethodType } from '../base/payment-methods/dto/method-type.enum';
import { AppGateway } from '../chat/chats.gateway';
import { PaymentMethodEntity } from '../base/payment-methods/infrastructure/payment-method.entity';
import { CurrencyPairEntity } from '../base/currencyPairs/infrastructure/currencyPairs.entity';
import { IsNull } from 'typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

const ORDER_TIMEOUT_MINUTES = 15;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    @InjectRepository(PaymentMethodEntity)
    private readonly paymentMethodRepository: Repository<PaymentMethodEntity>,
    @InjectRepository(CurrencyPairEntity)
    private readonly currencyPairRepository: Repository<CurrencyPairEntity>,
    @InjectBot('trader1Bot') private readonly trader1Bot: Telegraf<any>,
    @InjectBot('customerBot') private readonly customerBot: Telegraf<any>,

    private readonly appGateWay: AppGateway,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
  ): Promise<OrderEntity | null> {
    let usdtAmount = 0;
    const customer = await this.userRepository.findOne({
      where: { id: createOrderDto.customerId },
    });

    console.log('herrrrrrrrrrrrr', customer);

    const refererId = customer?.referralCode?.refererId;
    const referer = await this.userRepository.findOne({
      where: { id: refererId },
    });

    console.log('referrrrrrrrrrrrrrr', referer);
    const refererFee = referer?.fee;
    const customerCurrency = await this.currencyRepository.findOne({
      where: { id: createOrderDto.customerCurrencyId },
    });
    const receiverCurrency = await this.currencyRepository.findOne({
      where: { id: createOrderDto.receiverCurrencyId },
    });

    if (!customer || !referer || !customerCurrency || !receiverCurrency) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'statusNotExists',
        },
      });
    }

    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: {
        id: createOrderDto.paymentMethodId,
        userId: createOrderDto.customerId,
      },
    });
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    if (customerCurrency.id == 1) {
      usdtAmount = createOrderDto.amount;
    } else {
      const currencyPair = await this.currencyPairRepository.findOne({
        where: {
          baseCurrencyId: { id: customerCurrency.id },
          targetCurrencyId: { id: 1 },
        },
        relations: ['baseCurrencyId', 'targetCurrencyId'],
      });

      if (!currencyPair) {
        throw new NotFoundException('Currency pair not found');
      }

      usdtAmount =
        createOrderDto.amount *
        currencyPair.exchangeRate *
        (currencyPair.profit / 100);
    }

    const order = this.orderRepository.create({
      orderId: Date.now().toString(),
      ...createOrderDto,
      usdtAmount: Number(usdtAmount),
      customer: customer,
      customerCurrency: customerCurrency,
      receiverCurrency: receiverCurrency,
      paymentMethod: paymentMethod,
      status: OrderStatusEnum.PENDING,
      refererFee: refererFee,
    });

    order.orderId = order.orderId + order.customer.id.toString();

    return this.orderRepository.save(order);
  }

  async findReferredOrdersByReferer(
    customerReferralCode: string,
    traderReferralCode: string,
    trader2ReferralCode: string,
  ): Promise<OrderEntity[]> {
    if (
      !(
        this.isValidUUID(customerReferralCode) &&
        this.isValidUUID(traderReferralCode) &&
        this.isValidUUID(trader2ReferralCode)
      )
    ) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'please input uuid',
        },
      });
    }
    return this.orderRepository.find({
      select: {
        orderId: true,
        createdAt: true,
        refererFee: true,
      },
      where: [
        {
          customer: {
            referralCode: {
              id: customerReferralCode,
            },
          },
          status: OrderStatusEnum.COMPLETED,
        },
        {
          trader1: {
            referralCode: {
              id: traderReferralCode,
            },
          },
          status: OrderStatusEnum.COMPLETED,
        },
        {
          trader2: {
            referralCode: {
              id: trader2ReferralCode,
            },
          },
          status: OrderStatusEnum.COMPLETED,
        },
      ],
      relations: [
        'customer',
        'customer.referralCode',
        'trader1',
        'trader1.referralCode',
        'trader2',
        'trader2.referralCode',
      ],
    });
  }

  async resolveDispute(orderId: string): Promise<OrderEntity> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);
    order.status = OrderStatusEnum.CANCELED;
    return this.orderRepository.save(order);
  }

  async findOrdersByCustomer(customerId: User['id']): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: {
        customer: { id: customerId },
      },
      relations: [
        'customerCurrency',
        'receiverCurrency',
        'customer',
        'trader1',
        'trader2',
        'paymentMethod',
      ],
    });
  }
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterOrderDto | null;
    sortOptions?: SortOrderDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<OrderEntity[]> {
    const where: FindOptionsWhere<OrderEntity> = {};

    if (filterOptions?.statuses?.length) {
      where.status = In(filterOptions.statuses);
    }

    console.log('find', filterOptions);

    if (filterOptions?.orderTypes?.length) {
      where.orderType = In(filterOptions.orderTypes);
    }
    if (paginationOptions?.keyword) {
      where.orderId = ILike(`%${paginationOptions.keyword}%`);
    }

    console.log('findMany', filterOptions);

    // if (filterOptions?.isCash as any == 'true') {
    //   console.log('findMany1', filterOptions);
    //   where.paymentMethod = { type: PaymentMethodType.Cash };
    // } else if (filterOptions?.isCash as any == 'false') {
    //   console.log('findMany2', filterOptions);
    //   where.paymentMethod = Not({ type: PaymentMethodType.Cash });
    // }

    console.log('findMany', where);

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customerId')
      .leftJoinAndSelect('order.customerCurrency', 'customerCurrency')
      .leftJoinAndSelect('order.receiverCurrency', 'receiverCurrency')
      .leftJoinAndSelect('order.trader1', 'trader1')
      .leftJoinAndSelect('order.trader2', 'trader2')
      .leftJoinAndSelect('order.paymentMethod', 'paymentMethod')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .where(where)
      .andWhere('order.trader2 IS NULL')
      .andWhere('order.trader1 IS NULL')
      .andWhere(
        `"paymentMethod"."type" ${(filterOptions?.isCash as any) == 'true' ? '=' : '<>'} 'Cash'`,
      );

    if (sortOptions?.length) {
      for (let i = 0; i < sortOptions.length; i++) {
        if (sortOptions[i].order && sortOptions[i].orderBy)
          queryBuilder.addOrderBy(
            `order.${sortOptions[i].orderBy}`,
            sortOptions[i].order,
          );
      }
    }

    return queryBuilder.getMany();
  }
  async findManyWithPaginationByUser({
    userId,
    userRole,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    userId: number;
    userRole: number;
    filterOptions?: FilterOrderDto | null;
    sortOptions?: SortOrderDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<OrderEntity[]> {
    const where: FindOptionsWhere<OrderEntity> = {};

    if (userRole == RoleEnum.customer) where.customer = { id: userId };
    if (userRole == RoleEnum.trader) where.trader1 = { id: userId };
    if (userRole == RoleEnum.trader2) {
      where.trader2 = { id: userId };
      where.paymentMethod = { type: PaymentMethodType.Cash };
      where.status = OrderStatusEnum.COMPLETED;
    }

    if (filterOptions?.statuses?.length) {
      where.status = In(filterOptions.statuses);
    }

    if (filterOptions?.orderTypes?.length) {
      where.orderType = In(filterOptions.orderTypes);
    }
    if (paginationOptions?.keyword) {
      where.orderId = ILike(`%${paginationOptions.keyword}%`);
    }
    if (filterOptions?.isCash == true) {
      where.paymentMethod = { type: PaymentMethodType.Cash };
    }

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customerId')
      .leftJoinAndSelect('order.customerCurrency', 'customerCurrency')
      .leftJoinAndSelect('order.receiverCurrency', 'receiverCurrency')
      .leftJoinAndSelect('order.trader1', 'trader1')
      .leftJoinAndSelect('order.trader2', 'trader2')
      .leftJoinAndSelect('order.paymentMethod', 'paymentMethod')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .where(where);

    if (userRole == RoleEnum.trader) {
      queryBuilder.andWhere('trader1.currentBalance >= order.usdtAmount');
    }

    if (sortOptions?.length) {
      for (let i = 0; i < sortOptions.length; i++) {
        if (sortOptions[i].order && sortOptions[i].orderBy)
          queryBuilder.addOrderBy(
            `order.${sortOptions[i].orderBy}`,
            sortOptions[i].order,
          );
      }
    }

    return queryBuilder.getMany();
  }

  async findOrderByOrderId(orderId: string, user: any): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: {
        orderId: orderId,
      },
      relations: [
        'customerCurrency',
        'receiverCurrency',
        'paymentMethod',
        'customer',
        'trader1',
        'trader2',
      ],
    });

    if (!order) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'order not found',
        },
      });
    }

    if (
      order.status == OrderStatusEnum.VIEWING &&
      user.role.id == RoleEnum.trader
    ) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user,
          status: 'other trader is exploring this order',
        },
      });
    }

    if (
      user.role.id == RoleEnum.trader &&
      order.status == OrderStatusEnum.PENDING
    ) {
      order.status = OrderStatusEnum.VIEWING;
      await this.orderRepository.save(order);
    }

    return order;
  }

  async findOrderByOrderIdWithoutUserId(orderId: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: {
        orderId: orderId,
      },
      relations: [
        'customerCurrency',
        'receiverCurrency',
        'paymentMethod',
        'customer',
        'trader1',
        'trader2',
      ],
    });

    if (!order) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'order not found',
        },
      });
    }

    return order;
  }

  async pickOrder(
    traderId: User['id'],
    orderId: string,
    traderPaymentMethodId: number,
  ): Promise<OrderEntity> {
    const trader = await this.userRepository.findOne({
      where: { id: traderId, role: { id: 4 } },
    });
    if (!trader) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'trader not found',
        },
      });
    }

    const order = await this.findOrderByOrderIdWithoutUserId(orderId);
    console.log('hereeeeeeeeeeeeeee', order);
    // TODO: order.amount should be re calculated
    if (trader.currentBalance < order.usdtAmount)
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'trader deposit amount insufficient',
        },
      });
    if (order.status !== OrderStatusEnum.VIEWING) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'order is not available',
        },
      });
    }

    if (trader.tradeType == 2) order.orderType = 2;

    order.trader1 = trader;
    if (!trader || trader.role?.id != RoleEnum.trader) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Such a trader not exist',
        },
      });
    }

    order.status = OrderStatusEnum.TRADER1_DEPOSIT;
    order.traderFee = (trader.fee / 100) * order.usdtAmount;
    order.traderDepositedAt = new Date(Date.now());

    // TODO: recalculate refererFee(to USDT)
    const newRefererFee = (order.refererFee / 100) * order.usdtAmount;
    order.refererFee = newRefererFee;

    //TODO: currency exchange
    const newCurrentBalance =
      parseFloat(trader.currentBalance.toString()) -
      order.usdtAmount -
      order.traderFee -
      order.refererFee;
    if (newCurrentBalance < 0) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Insufficient amount to deposit',
        },
      });
    }
    const newProcessingBalance =
      parseFloat(trader.processingBalance.toString()) +
      order.usdtAmount +
      order.traderFee +
      order.refererFee;
    trader.currentBalance = newCurrentBalance;
    trader.processingBalance = newProcessingBalance;
    delete trader.__entity;
    await this.userRepository.update(trader.id, trader);

    try {
      await this.appGateWay.sendNotificationToUser(trader.id, {
        title: 'Order picked',
        content: `Order ${order.id} picked`,
        receiverId: trader.id,
      });
    } catch (error) {
      console.log('Error while send notification', error);
    }

    try {
      if (trader.tgId) {
        await this.trader1Bot.telegram.sendMessage(
          trader.tgId,
          `Order ${order.id} picked`,
        );
      }

      if (order.customer.tgId) {
        await this.customerBot.telegram.sendMessage(
          order.customer.tgId,
          `Order ${order.id} picked by ${trader.tgUserName}`,
        );
      }
    } catch (error) {
      console.log('Error while send notification to bot', error);
    }

    order.traderPaymentMethodId = traderPaymentMethodId;

    return this.orderRepository.save(order);
  }

  async disputeOrder(orderId: string): Promise<OrderEntity> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);

    if (
      order.status == OrderStatusEnum.PENDING ||
      order.status == OrderStatusEnum.VIEWING
    ) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'DISPUTE does not work in pending or viewing state',
        },
      });
    }

    order.status = OrderStatusEnum.DISPUTE;
    return this.orderRepository.save(order);
  }

  async customerSent(orderId: string): Promise<OrderEntity> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);

    if (order.status !== OrderStatusEnum.TRADER1_DEPOSIT) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Order is not in trader1_deposit state',
        },
      });
    }

    order.customerSentAt = new Date(Date.now());

    order.status = OrderStatusEnum.CUSTOMER_SENT;
    return this.orderRepository.save(order);
  }

  async transferFileUpload(
    orderId: string,
    transferFilePath: string,
  ): Promise<OrderEntity> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);

    order.transferFilePath = transferFilePath;
    return this.orderRepository.save(order);
  }

  async traderReceived(orderId: string): Promise<OrderEntity> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);

    if (order.status !== OrderStatusEnum.CUSTOMER_SENT) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Order is not in customerSent state',
        },
      });
    }

    order.status = OrderStatusEnum.TRADER_RECEIVED;
    order.traderReceivedAt = new Date(Date.now());
    return this.orderRepository.save(order);
  }

  async traderPaid(
    orderId: string,
    receiptFilePath?: string,
  ): Promise<OrderEntity> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);

    if (order.orderType == 1) {
      if (order.status !== OrderStatusEnum.TRADER_RECEIVED) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'Order is not in traderReceived state',
          },
        });
      }
    } else {
      if (order.status !== OrderStatusEnum.TRADER2_PARTICIPATED) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'Order is not in traderReceived state',
          },
        });
      }
    }

    if (order.orderType !== 1) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Trader could not directly pay at this order',
        },
      });
    }

    order.status = OrderStatusEnum.TRADER_PAID;
    order.traderPaidAt = new Date(Date.now());

    if (receiptFilePath) {
      order.receiptFilePath = receiptFilePath;
    }

    return this.orderRepository.save(order);
  }

  async trader2Participated(
    trader2Id: number,
    orderId: string,
  ): Promise<OrderEntity> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);

    const trader2 = await this.userRepository.findOne({
      where: { id: trader2Id, role: { id: 5 } },
    });
    if (!trader2) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Trader2 not found',
        },
      });
    }

    if (order.status !== OrderStatusEnum.TRADER_RECEIVED) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Order is not in traderReceived state',
        },
      });
    }

    order.status = OrderStatusEnum.TRADER2_PARTICIPATED;
    order.trader2ParticipatedAt = new Date(Date.now());
    return this.orderRepository.save(order);
  }

  async cancelOrder(orderId: string): Promise<OrderEntity> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);
    // if (order.status === OrderStatusEnum.TRADER_PAID || order.status === OrderStatusEnum.CUSTOMER_SENT || order.status === OrderStatusEnum.TRADER_RECEIVED) {
    //   const trader = await this.userRepository.findOne({
    //     where: { id: order.trader1.id, role: { id: 4 } },
    //   });
    //   if (!trader) {
    //     throw new UnprocessableEntityException({
    //       status: HttpStatus.UNPROCESSABLE_ENTITY,
    //       errors: {
    //         status: 'trader not found',
    //       },
    //     });
    //   }
    //   const newCurrentBalance =
    //     parseFloat(trader.currentBalance.toString()) + order.amount + order.traderFee + order.refererFee;

    //   trader.currentBalance = newCurrentBalance;
    //   trader.processingBalance = parseFloat(trader.processingBalance.toString()) - order.amount - order.traderFee - order.refererFee;
    //   await this.userRepository.update(trader.id, {
    //     currentBalance: trader.currentBalance,
    //     processingBalance: trader.processingBalance,
    //   });
    // }

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Update order status
    order.status = OrderStatusEnum.CANCELED;
    order.canceledAt = new Date();

    return this.orderRepository.save(order);
  }

  async cancelView(orderId: string): Promise<OrderEntity> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);

    order.status = OrderStatusEnum.PENDING;
    return this.orderRepository.save(order);
  }

  async refundToTrader(orderId: string): Promise<boolean> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);
    const trader = await this.userRepository.findOne({
      where: { id: order.trader1.id, role: { id: 4 } },
    });

    if (!trader) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'trader not found',
        },
      });
    }

    const newCurrentBalance =
      parseFloat(trader.currentBalance.toString()) +
      order.usdtAmount +
      order.traderFee +
      order.refererFee;
    const processingBalance =
      parseFloat(trader.processingBalance.toString()) -
      order.usdtAmount -
      order.traderFee -
      order.refererFee;
    trader.currentBalance = newCurrentBalance;
    trader.processingBalance = processingBalance;
    await this.userRepository.update(trader.id, trader);
    return true;
  }

  async refundToTraderWithoutFee(orderId: string): Promise<boolean> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);
    const trader = await this.userRepository.findOne({
      where: { id: order.trader1.id, role: { id: 4 } },
    });

    if (!trader) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'trader not found',
        },
      });
    }

    const newCurrentBalance =
      parseFloat(trader.currentBalance.toString()) + order.usdtAmount;
    const processingBalance =
      parseFloat(trader.processingBalance.toString()) -
      order.usdtAmount -
      order.traderFee -
      order.refererFee;
    trader.currentBalance = newCurrentBalance;
    trader.processingBalance = processingBalance;
    await this.userRepository.update(trader.id, {
      currentBalance: trader.currentBalance,
      processingBalance: trader.processingBalance,
    });

    const admin = await this.userRepository.findOne({
      where: { userName: 'SuperAdmin@email.com' },
    });
    if (!admin) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'SuperAdmin not found',
        },
      });
    }

    admin.currentBalance =
      parseFloat(admin.currentBalance.toString()) + order.traderFee;

    await this.userRepository.update(admin.id, {
      currentBalance: admin.currentBalance,
    });

    const customer = await this.userRepository.findOne({
      where: { id: order.customer.id },
    });
    const refererId = customer?.referralCode?.refererId;
    const referer = await this.userRepository.findOne({
      where: { id: refererId },
    });

    if (!customer || !referer) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Customer or Referer of Customer not found',
        },
      });
    }

    referer.currentBalance =
      parseFloat(referer.currentBalance.toString()) + order.refererFee;

    await this.userRepository.update(referer.id, {
      currentBalance: referer.currentBalance,
    });

    return true;
  }

  async notRefundToTrader(orderId: string): Promise<boolean> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);
    const trader = await this.userRepository.findOne({
      where: { id: order.trader1.id, role: { id: 4 } },
    });

    if (!trader) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'trader not found',
        },
      });
    }

    const processingBalance =
      parseFloat(trader.processingBalance.toString()) -
      order.usdtAmount -
      order.traderFee -
      order.refererFee;
    trader.processingBalance = processingBalance;
    await this.userRepository.update(trader.id, {
      processingBalance: trader.processingBalance,
    });

    const admin = await this.userRepository.findOne({
      where: { userName: 'SuperAdmin@email.com' },
    });
    if (!admin) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'SuperAdmin not found',
        },
      });
    }

    admin.currentBalance =
      parseFloat(admin.currentBalance.toString()) +
      order.usdtAmount +
      order.traderFee;

    await this.userRepository.update(admin.id, {
      currentBalance: admin.currentBalance,
    });

    const customer = await this.userRepository.findOne({
      where: { id: order.customer.id },
    });
    const refererId = customer?.referralCode?.refererId;
    const referer = await this.userRepository.findOne({
      where: { id: refererId },
    });

    if (!customer || !referer) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Customer or Referer of Customer not found',
        },
      });
    }

    referer.currentBalance =
      parseFloat(referer.currentBalance.toString()) + order.refererFee;

    await this.userRepository.update(referer.id, {
      currentBalance: referer.currentBalance,
    });

    return true;
  }

  async refundToTraderOnlyFee(orderId: string): Promise<boolean> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);
    const trader = await this.userRepository.findOne({
      where: { id: order.trader1.id, role: { id: 4 } },
    });

    if (!trader) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'trader not found',
        },
      });
    }

    const newCurrentBalance =
      parseFloat(trader.currentBalance.toString()) +
      order.traderFee +
      order.refererFee;
    const processingBalance =
      parseFloat(trader.processingBalance.toString()) -
      order.usdtAmount -
      order.traderFee -
      order.refererFee;
    trader.currentBalance = newCurrentBalance;
    trader.processingBalance = processingBalance;
    await this.userRepository.update(trader.id, {
      currentBalance: trader.currentBalance,
      processingBalance: trader.processingBalance,
    });

    const admin = await this.userRepository.findOne({
      where: { userName: 'SuperAdmin@email.com' },
    });
    if (!admin) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'SuperAdmin not found',
        },
      });
    }

    admin.currentBalance =
      parseFloat(admin.currentBalance.toString()) + order.usdtAmount;

    await this.userRepository.update(admin.id, {
      currentBalance: admin.currentBalance,
    });

    return true;
  }

  async checkExpiredOrders(): Promise<void> {
    try {
      // Get orders in TRADER1_DEPOSIT status
      const pendingOrders = await this.orderRepository.find({
        where: {
          status: OrderStatusEnum.TRADER1_DEPOSIT,
          customerSentAt: IsNull(),
        },
        relations: ['customer', 'trader1', 'trader2'],
      });

      for (const order of pendingOrders) {
        const traderDepositTime = new Date(order.traderDepositedAt).getTime();
        const currentTime = new Date().getTime();
        const timeDiffMinutes = (currentTime - traderDepositTime) / (1000 * 60);

        if (timeDiffMinutes > ORDER_TIMEOUT_MINUTES) {
          // Cancel order and refund to trader
          await this.cancelOrder(order.orderId);
          await this.refundToTrader(order.orderId);

          // Notify users about cancellation
          if (order.customer?.tgId) {
            this.appGateWay.server.emit(`notification_${order.customer.tgId}`, {
              message: `Order ${order.orderId} has been automatically cancelled due to payment timeout.`,
            });
          }
          if (order.trader1?.tgId) {
            this.appGateWay.server.emit(`notification_${order.trader1.tgId}`, {
              message: `Order ${order.orderId} has been automatically cancelled due to payment timeout. Funds will be refunded.`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking expired orders:', error);
    }
  }

  async customerConfirmed(orderId: string): Promise<OrderEntity> {
    const order = await this.findOrderByOrderIdWithoutUserId(orderId);

    if (order.orderType == 1) {
      if (order.status !== OrderStatusEnum.TRADER_PAID) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'Order is not in traderPaid state',
          },
        });
      }
    } else {
      if (!order.trader2ParticipatedAt) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'Order is not in trader2Participated state',
          },
        });
      }
    }

    const trader = await this.userRepository.findOne({
      where: { id: order.trader1.id },
    });

    console.error('Customer confirm:', trader);

    if (!trader) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'trader not found',
        },
      });
    }

    // Process funds based on order type
    if (order.orderType == 1) {
      let newCurrentBalance = 0;
      if (trader.currentBalance)
        newCurrentBalance =
          parseFloat(trader.currentBalance.toString()) + order.usdtAmount;
      trader.currentBalance = newCurrentBalance;
    } else {
      let trader1CurrentBalance = 0;
      if (trader.currentBalance)
        trader1CurrentBalance =
          parseFloat(trader.currentBalance.toString()) + 0;
      trader.currentBalance = trader1CurrentBalance;

      const trader2 = await this.userRepository.findOne({
        where: { id: order.trader2.id },
      });

      if (!trader2) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'trader2 not found',
          },
        });
      }

      let newCurrentBalance = 0;
      if (trader2.currentBalance)
        newCurrentBalance =
          parseFloat(trader2.currentBalance.toString()) + order.usdtAmount;
      trader2.currentBalance = newCurrentBalance;
      await this.userRepository.update(trader2.id, {
        currentBalance: trader2.currentBalance,
      });
    }

    trader.processingBalance =
      trader.processingBalance -
      order.usdtAmount -
      order.traderFee -
      order.refererFee;

    await this.userRepository.update(trader.id, {
      currentBalance: trader.currentBalance,
      processingBalance: trader.processingBalance,
    });

    // Process admin fees
    const admin = await this.userRepository.findOne({
      where: { userName: 'SuperAdmin@email.com' },
    });

    if (!admin) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'SuperAdmin not found',
        },
      });
    }

    if (admin.currentBalance) {
      admin.currentBalance =
        parseFloat(admin.currentBalance.toString()) +
        parseFloat(order.traderFee.toString());
    } else {
      admin.currentBalance = order.traderFee;
    }

    await this.userRepository.update(admin.id, {
      currentBalance: admin.currentBalance,
    });

    // Process referrer fees
    const customer = await this.userRepository.findOne({
      where: { id: order.customer.id },
    });
    const refererId = customer?.referralCode?.refererId;
    const referer = await this.userRepository.findOne({
      where: { id: refererId },
    });

    if (!customer || !referer) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Customer or Referer of Customer not found',
        },
      });
    }

    referer.currentBalance =
      parseFloat(referer.currentBalance.toString()) +
      parseFloat(order.refererFee.toString());

    await this.userRepository.update(referer.id, {
      currentBalance: referer.currentBalance,
    });

    order.status = OrderStatusEnum.COMPLETED;
    order.customerConfirmedAt = new Date(Date.now());
    return this.orderRepository.save(order);
  }

  isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
