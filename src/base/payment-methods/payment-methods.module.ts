import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodEntity } from './infrastructure/payment-method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethodEntity])],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
