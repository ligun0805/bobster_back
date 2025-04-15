import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Between, LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FeeScheduleEntity } from '../base/feeSchedule/infrastructure/feeSchedules.entity';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { OrdersService } from '../order/orders.service';
import axios from 'axios';
import { TransactionEntity } from '../transactions/infrastructure/transaction.entity';

@Injectable()
export class CronJobService {
  constructor(
    private ordersService: OrdersService,
    @InjectRepository(FeeScheduleEntity)
    private readonly feeScheduleRepository: Repository<FeeScheduleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>, // Добавляем репозиторий для транзакций
  ) {}

  private TON_WALLET_ADDRESS =
    'UQB4GKEIQNi9LZevv3PFG3VyEibLdS5Uc0BQ_4Ax7ZXJIPTF';
  private USDT_JETTON_ADDRESS =
    'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';
  private TON_API_URL = 'https://toncenter.com/api/v3/transactions';

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    console.log(
      '🔄 Running cron job: Checking wallet transactions and updating fees',
    );

    await this.checkUSDTTransactions();
    await this.updateUserFees();
    await this.ordersService.checkExpiredOrders();
  }

  private async checkUSDTTransactions() {
    try {
      const response = await axios.get(
        `${this.TON_API_URL}?account=${this.TON_WALLET_ADDRESS}&limit=10`,
      );
      const transactions = response.data.transactions;

      for (const tx of transactions) {
        // Проверяем, что это входящая транзакция в наш кошелек
        if (tx.in_msg && tx.in_msg.destination === this.TON_WALLET_ADDRESS) {
          const amount = parseFloat(tx.in_msg.value) / 1e6; // USDT хранятся в base units
          const sender = tx.in_msg.source;
          const txHash = tx.hash;

          // Проверяем, есть ли уже эта транзакция в базе
          const existingTransaction = await this.transactionRepository.findOne({
            where: { txHash },
          });

          if (existingTransaction) {
            console.log(`⏳ Транзакция ${txHash} уже обработана, пропускаем.`);
            continue;
          }

          console.log(`📥 Получено ${amount} USDT от ${sender}`);

          // Находим пользователя по адресу кошелька
          const user = await this.userRepository.findOne({
            where: { wallet: sender },
          });

          if (user) {
            console.log(
              `💰 Обновляем баланс пользователя ${user.id} на ${amount} USDT`,
            );
            user.currentBalance = (user.currentBalance || 0) + amount;
            await this.userRepository.save(user);

            // ✅ Сохраняем транзакцию, чтобы не обработать повторно
            await this.transactionRepository.save({
              txHash,
              sender,
              amount,
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Ошибка при проверке USDT-транзакций:', error.message);
    }
  }

  private async updateUserFees() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const feeSchedules = await this.feeScheduleRepository.find({
      where: { fromDate: Between(today, tomorrow) },
    });

    for (const feeSchedule of feeSchedules) {
      if (feeSchedule.userId == 0) {
        const defaultFees = await this.feeScheduleRepository.find({
          where: {
            userId: 0,
            userType: feeSchedule.userType,
            fromDate: LessThan(today),
          },
        });

        if (defaultFees.length) {
          const defaultFee = defaultFees[0];
          await this.userRepository.update(
            { role: { id: feeSchedule.userType }, fee: defaultFee.fee },
            { fee: feeSchedule.fee },
          );
          await this.feeScheduleRepository.delete(defaultFee.id);
          console.log(
            `Type ${defaultFee.userType} - User Default Fee is Updated as ${feeSchedule.fee},`,
          );
        }
      } else {
        await this.userRepository.update(
          { id: feeSchedule.userId },
          { fee: feeSchedule.fee },
        );
        console.log(
          `User [${feeSchedule.userId}] Fee is Updated as ${feeSchedule.fee},`,
        );
        await this.feeScheduleRepository.delete(feeSchedule);
      }
    }
  }
}
