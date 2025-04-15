import {
  Injectable,
  UnprocessableEntityException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeScheduleEntity } from './infrastructure/feeSchedules.entity';
import { CreateFeeScheduleDto } from './dto/create-feeSchedule.dto';
import { UserEntity } from '../../users/infrastructure/entities/user.entity';

@Injectable()
export class FeeSchedulesService {
  constructor(
    @InjectRepository(FeeScheduleEntity)
    private readonly feeScheduleRepository: Repository<FeeScheduleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createFeeDto: CreateFeeScheduleDto): Promise<void> {
    if (!createFeeDto.fromDate) {
      const now = new Date();
      const defaultFee = (
        await this.feeScheduleRepository.find({
          where: { userId: 0, userType: createFeeDto.userType },
        })
      ).at(0);
      if (createFeeDto.userId == 0) {
        await this.userRepository.update(
          { role: { id: createFeeDto.userType }, fee: defaultFee?.fee },
          { fee: createFeeDto.fee },
        );
        const result = await this.feeScheduleRepository.update(
          { userId: createFeeDto.userId, userType: createFeeDto.userType },
          { fee: createFeeDto.fee, fromDate: now },
        );
        if (!result.affected)
          throw new UnprocessableEntityException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              status: 'No Referer or Trader Type',
            },
          });
      } else {
        const result = await this.userRepository.update(
          { id: createFeeDto.userId },
          { fee: createFeeDto.fee },
        );
        if (!result.affected)
          throw new UnprocessableEntityException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              status: 'No such a user',
            },
          });
      }
    } else {
      const now = new Date();
      const from = new Date(createFeeDto.fromDate);

      if (from <= now)
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'Time should be after today',
          },
        });
      const originFee = await this.feeScheduleRepository.find({
        where: {
          userId: createFeeDto.userId,
          userType: createFeeDto.userType,
        },
      });

      if (originFee.length) {
        await this.feeScheduleRepository.update(
          { id: originFee[0].id },
          { fee: createFeeDto.fee, fromDate: createFeeDto.fromDate },
        );
      } else {
        await this.feeScheduleRepository.save(
          this.feeScheduleRepository.create(createFeeDto),
        );
      }
    }
  }

  async getDefaultRefererFee(): Promise<number> {
    const fee = await this.feeScheduleRepository.findOne({
      where: {
        userId: 0,
        userType: 2,
      },
    });

    if (!fee) {
      throw new NotFoundException('Trader Default Fee not found');
    }

    return fee.fee;
  }

  async getDefaultTraderFee(): Promise<number> {
    const fee = await this.feeScheduleRepository.findOne({
      where: {
        userId: 0,
        userType: 4,
      },
    });

    if (!fee) {
      throw new NotFoundException('Trader Default Fee not found');
    }

    return fee.fee;
  }
}
