import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../../roles/infrastructure/role.entity';
import { RoleEnum } from '../../../roles/roles.enum';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
  ) {}

  async run() {
    const countSuperAdmin = await this.repository.count({
      where: {
        id: RoleEnum.SuperAdmin,
      },
    });

    if (!countSuperAdmin) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.SuperAdmin,
          name: 'SuperAdmin',
        }),
      );
    }
    const countAdmin = await this.repository.count({
      where: {
        id: RoleEnum.Admin,
      },
    });

    if (!countAdmin) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.Admin,
          name: 'Admin',
        }),
      );
    }

    const countCustomer = await this.repository.count({
      where: {
        id: RoleEnum.customer,
      },
    });

    if (!countCustomer) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.customer,
          name: 'Customer',
        }),
      );
    }

    const countTrader = await this.repository.count({
      where: {
        id: RoleEnum.trader,
      },
    });

    if (!countTrader) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.trader,
          name: 'Trader',
        }),
      );
    }
    const countTrader2 = await this.repository.count({
      where: {
        id: RoleEnum.trader2,
      },
    });

    if (!countTrader2) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.trader2,
          name: 'Trader2',
        }),
      );
    }

    const countReferer = await this.repository.count({
      where: {
        id: RoleEnum.referer,
      },
    });

    if (!countReferer) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.referer,
          name: 'Referer',
        }),
      );
    }
  }
}
