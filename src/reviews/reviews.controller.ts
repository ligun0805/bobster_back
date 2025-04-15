import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEntity } from './infrastructure/review.entity';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';

@ApiTags('Review')
@Controller({
  path: 'reviews',
  version: '1',
})
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) {}

  @Post()
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    return this.reviewService.createReview(createReviewDto);
  }

  @Get('trader/:traderId')
  async getReviewsByTrader(
    @Param('traderId') traderId: number,
  ): Promise<ReviewEntity[]> {
    return this.reviewService.getReviewsByTrader(traderId);
  }

  @Get('customer/:customerId')
  async getReviewsByCustomer(
    @Param('customerId') customerId: number,
  ): Promise<ReviewEntity[]> {
    return this.reviewService.getReviewsByCustomer(customerId);
  }

  @Get('/review/:orderId')
  @Roles(RoleEnum.customer)
  async findReviewByOrderId(
    @Param('orderId') orderId: string,
  ): Promise<ReviewEntity> {
    return this.reviewService.findReviewByOrderId(orderId);
  }
}
