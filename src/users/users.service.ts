import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly dbService: DatabaseService) {}

  /********************************************
   * 	Find many users and filters
   */
  async findAll(params: {
    skip?: number;
    take: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    //     include?: Prisma.UserInclude;
  }): Promise<any | undefined> {
    const { skip, take, where, orderBy } = params;

    return this.dbService.user.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        roles: true,
        profile: true,
      },
    });
  }

  /********************************************
   * 	Find a user and filter  : Promise<IUserWithRelate>
   */
  async findUser(where?: Prisma.UserWhereUniqueInput) {
    return this.dbService.user.findUnique({
      where,
      include: {
        profile: {
          include: {
            profile_images: true,
          },
        },
        roles: true,
      },
    });
  }

  /********************************************
   * 	Find total of users and filters the results
   */
  async findTotal(param: { where?: Prisma.UserWhereInput }): Promise<number> {
    const { where } = param;
    return this.dbService.user.count({ where });
  }

  /********************************************
   * 	Find a user and filter
   */
  async editUser(params: {
    where?: Prisma.UserWhereUniqueInput;
    data?: Prisma.UserUpdateInput;
  }) {
    const { where, data } = params;

    return this.dbService.user.update({ where, data });
  }
}
