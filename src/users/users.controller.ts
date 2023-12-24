import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AdminService } from 'src/admin/admin.service';
import { GetUserId, Public } from 'src/auth/decorators';
import {
  UserUpdateDto,
  UserUpdateImagesDto,
  UserUpdatePasswordDto,
} from 'src/dtos/user';
import { IUserWithPaginate, IUserWithRelate } from 'src/interfaces';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly adminService: AdminService,
  ) {}

  /*****************************************************************************************
   * @desc	Get many users
   * @route	GET, api/users
   * @access	Public
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('/test')
  getTest() {
    return { message: 'Hello World', statusCode: 200 };
  }

  /*****************************************************************************************
   * @desc	Get many users
   * @route	GET, api/users
   * @access	Public
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get()
  async getUsers(
    @Query('id') id?: string,
    @Query('first_name') first_name?: string,
    @Query('last_name') last_name?: string,
    @Query('address') address?: string,
    @Query('sex') sex?: string,
    @Query('date_of_birth') date_of_birth?: Date,
    @Query('email') email: string = '',
    @Query('pageNo') pageNo: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('sortBy') sortBy: string = 'id',
    @Query('sortType') sortType: 'asc' | 'desc' = 'desc',
  ): Promise<IUserWithPaginate> {
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: sortType,
    };

    const where: Prisma.UserWhereInput = {
      OR: [
        {
          id: {
            startsWith: id,
            mode: 'insensitive',
          },
        },
        {
          first_name: {
            startsWith: first_name,
            mode: 'insensitive',
          },
        },
        {
          last_name: {
            startsWith: last_name,
            mode: 'insensitive',
          },
        },
        {
          email: {
            startsWith: email,
            mode: 'insensitive',
          },
        },
        {
          address: {
            startsWith: address,
            mode: 'insensitive',
          },
        },
        {
          sex: {
            startsWith: sex,
            mode: 'insensitive',
          },
        },
        {
          date_of_birth: date_of_birth,
        },
      ],
    };

    const page_no = Number(pageNo);
    const page_size = Number(pageSize);
    const users = await this.userService.findManyAsync({
      skip: (page_no - 1) * page_size,
      take: page_size,
      where,
      orderBy,
    });

    const total = await this.userService.findTotalAsync(where);

    const response: IUserWithPaginate = {
      total,
      pageNo,
      pageSize,
      users,
    };

    return response;
  }

  /*****************************************************************************************
   * @desc	Get a single user
   * @route	GET, api/:userId
   * @access	Public
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    const existUser = await this.userService.findOneAsync({
      id: userId,
    });

    if (!existUser)
      throw new NotFoundException(`There is no user with id of ${userId}`);

    delete existUser['hash_password'];
    return existUser;
  }

  /*****************************************************************************************
   * @desc	Edit user by user id
   * @route	PATCH, api/users/update-user
   * @access	Private - Owner only
   */
  @HttpCode(HttpStatus.OK)
  @Patch('update-user')
  async editUser(
    @GetUserId() userId: string,
    @Body() dto: UserUpdateDto,
  ): Promise<any> {
    const user = await this.userService.findOneAsync({ id: userId });

    if (!user) throw new NotFoundException();

    const fieldToUpdate: Prisma.UserUpdateInput = {
      first_name: dto.first_name ? dto.first_name : user.first_name,
      last_name: dto.last_name ? dto.last_name : user.last_name,
      sex: dto.sex ? dto.sex : user.sex,
      address: dto.address ? dto.address : user.address,
      phone_no: dto.phone_no ? dto.phone_no : user.phone_no,
      date_of_birth: dto.date_of_birth
        ? new Date(dto.date_of_birth)
        : user.date_of_birth,
    };

    return await this.userService.editAsync(
      {
        id: userId,
      },
      fieldToUpdate,
    );
  }

  /*****************************************************************************************
   * @desc	Edit password
   * @route	PATCH, api/users/update-password
   * @access	Private - Owner only
   */
  @HttpCode(HttpStatus.OK)
  @Patch('update-password')
  async editPassword(
    @GetUserId() userId: string,
    @Body() dto: UserUpdatePasswordDto,
  ): Promise<any> {
    const user: IUserWithRelate = await this.userService.findOneAsync({
      id: userId,
    });

    if (!user) throw new NotFoundException();

    // Compared input password with the password(hash_password) on database
    const pwdMatches = await this.adminService.comparedData(
      dto.current_password,
      user.password,
    );

    if (!pwdMatches)
      throw new BadRequestException(
        'Invalid the current password, Please try again.',
      );

    const fieldToUpdate: Prisma.UserUpdateInput = {
      password: await this.adminService.hashedData(dto.new_password),
    };

    // Update new password
    await this.userService.editAsync({ id: userId }, fieldToUpdate);

    const payload = this.adminService.getPayload(
      user.id,
      user.email,
      user.roles,
    );

    // Generate new tokens
    const tokens = await this.adminService.getTokens(payload);

    // Update refresh to db
    await this.adminService.updateRefreshToken(userId, tokens.refresh_token);

    return { ...tokens };
  }

  /*****************************************************************************************
   * @desc	Edit profile images
   * @route	PATCH, api/users/update-images
   * @access	Private - Owner only
   */
  @HttpCode(HttpStatus.OK)
  @Patch('update-images')
  async editImages(
    @GetUserId() userId: string,
    @Body() dto: UserUpdateImagesDto,
  ): Promise<any> {
    // Remove old images from user
    await this.userService.editAsync(
      { id: userId },
      {
        profile_images: {
          deleteMany: {},
        },
      },
    );

    const fieldToUpdate = dto.profile_images.map((image) => ({
      id: this.adminService.getRandomPK('pid'),
      path: image,
    }));

    // Add new images to user
    return await this.userService.editAsync(
      { id: userId },
      {
        profile_images: {
          createMany: {
            data: fieldToUpdate,
          },
        },
      },
    );
  }

  /*****************************************************************************************
   * @desc	Remove an user. And it must be the owner.
   * @route	POST, api/users/:userId/remove
   * @access	Private - Owner only
   */
  @HttpCode(HttpStatus.OK)
  @Post(':userId/remove')
  async removeUser(
    @Param('userId') userId: string,
    @GetUserId() id: string,
  ): Promise<any> {
    if (userId !== id)
      throw new BadRequestException(
        `The specific user id does not matches with id from token`,
      );

    if (!(await this.userService.findOneAsync({ id })))
      throw new NotFoundException(`There is no user with id of ${userId}`);

    return await this.userService.deleteAsync({ id: userId });
  }
}
