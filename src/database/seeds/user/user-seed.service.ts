import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { RoleEnum } from '../../../roles/roles.enum';
import { StatusEnum } from '../../../statuses/statuses.enum';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async run() {
    //Seed first #SuperAdmin#
    const countSuperAdmin = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.SuperAdmin,
        },
      },
    });

    if (!countSuperAdmin) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('Admin#1552', salt);
      await this.repository.save(
        this.repository.create({
          userName: 'SuperAdmin@email.com',
          tgId: password,
          role: {
            id: RoleEnum.SuperAdmin,
            name: 'SuperAdmin',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
          referralCode: {
            id: '0bbaf20c-0025-46ed-b9f3-d5fb5ee94484',
            refererId: 0,
            roleId: RoleEnum.SuperAdmin,
          },
        }),
      );
    }

    //Seed first #Referer#
    /*
    const countReferer = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.referer,
        },
      },
    });

    if (!countReferer) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          userName: 'Doe',
          email: 'referer@example.com',
          password,
          role: {
            id: RoleEnum.referer,
            name: 'Referer',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
      );
    }
    */
  }
}
