import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly dbService: DatabaseService) {}

  /********************************************
   * 	Find many users and filters
   */
  async findManyAsync(params: {
    skip?: number;
    take: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<any> {
    const { skip, take, where, orderBy } = params;

    return this.dbService.user.findMany({
      skip,
      take,
      where,
      orderBy,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        roles: true,
        profile_images: true,
      },
    });
  }

  /********************************************
   * 	Find a user and filter  : Promise<IUserWithRelate>
   */
  async findOneAsync(where?: Prisma.UserWhereUniqueInput) {
    return this.dbService.user.findUnique({
      where,
      include: {
        profile_images: true,
        roles: true,
      },
    });
  }

  /********************************************
   * 	Find total of users and filters the results
   */
  async findTotalAsync(where?: Prisma.UserWhereInput): Promise<number> {
    return this.dbService.user.count({ where });
  }

  /********************************************
   * 	Edit user with user id
   */
  async editAsync(
    where?: Prisma.UserWhereUniqueInput,
    data?: Prisma.UserUpdateInput,
  ) {
    return this.dbService.user.update({ where, data });
  }

  /********************************************
   * 	Remove user with using user id
   */
  async deleteAsync(where: Prisma.UserWhereUniqueInput): Promise<any> {
    return this.dbService.user.delete({
      where,
    });
  }
}
