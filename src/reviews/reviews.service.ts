// src/review/review.service.ts
import {
  Injectable,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './infrastructure/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { OrderEntity } from '../order/infrastructure/order.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async createReview(createReviewDto: CreateReviewDto): Promise<ReviewEntity> {
    const customer = await this.userRepository.findOne({
      where: { id: createReviewDto.customerId },
    });
    const trader = await this.userRepository.findOne({
      where: { id: createReviewDto.traderId },
    });
    const order = await this.orderRepository.findOne({
      where: { orderId: createReviewDto.orderId },
    });
    if (!customer || !trader || !order) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'customer or trader or order donot exist',
        },
      });
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      customer,
      trader,
      order,
    });
    return this.reviewRepository.save(review);
  }

  async getReviewsByTrader(traderId: number): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({ where: { trader: { id: traderId } } });
  }

  async getReviewsByCustomer(customerId: number): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({
      where: { customer: { id: customerId } },
    });
  }

  async findReviewByOrderId(orderId: string): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findOne({
      where: { order: { id: orderId } },
    });

    if (!review) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Review not found',
        },
      });
    }

    return review;
  }
}
