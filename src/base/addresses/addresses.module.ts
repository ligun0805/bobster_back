import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { AddressEntity } from './infrastructure/address.entity';
import { UserEntity } from '../../users/infrastructure/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AddressEntity, UserEntity])],
  providers: [AddressesService],
  controllers: [AddressesController],
})
export class AddressesModule {}
