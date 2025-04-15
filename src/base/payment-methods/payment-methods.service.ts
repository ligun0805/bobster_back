import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodEntity } from './infrastructure/payment-method.entity';
import { Repository } from 'typeorm';
import { GetPaymentMethodDtos } from './dto/get-payment-methods.dto';
import { RemovePaymentMethodDto } from './dto/remove-payment-method.dto';
import { GetPaymentMethodDto } from './dto/get-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethodEntity)
    private readonly paymentMethodRepository: Repository<PaymentMethodEntity>,
  ) {}

  async create(
    createPaymentMethodDto: CreatePaymentMethodDto,
    id: number,
  ): Promise<PaymentMethodEntity> {
    const data = { ...createPaymentMethodDto, userId: id };
    const paymentMethod = this.paymentMethodRepository.create(data);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async update(
    updatePaymentMethodDto: UpdatePaymentMethodDto,
    id: number,
  ): Promise<PaymentMethodEntity> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: updatePaymentMethodDto.id, userId: id },
    });
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }
    Object.assign(paymentMethod, updatePaymentMethodDto);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async findOne(
    getPaymentMethodDto: GetPaymentMethodDto,
  ): Promise<PaymentMethodEntity> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: {
        id: getPaymentMethodDto.id,
        userId: getPaymentMethodDto.user_id,
      },
    });
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }
    return paymentMethod;
  }

  async findAll(
    getPaymentMethodDto: GetPaymentMethodDtos,
  ): Promise<PaymentMethodEntity[]> {
    const paymentMethod = await this.paymentMethodRepository.find({
      where: { userId: getPaymentMethodDto.id },
    });
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }
    return paymentMethod;
  }

  async remove(
    removePaymentMethodDto: RemovePaymentMethodDto,
    id: number,
  ): Promise<void> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: removePaymentMethodDto.id, userId: id },
    });
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    } else {
      const result = await this.paymentMethodRepository.delete(
        paymentMethod.id,
      );
      if (result.affected === 0) {
        throw new NotFoundException('Payment method not found');
      }
    }
  }
}
