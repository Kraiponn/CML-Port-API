import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Prisma, RoleType } from '@prisma/client';
import { LoginDto } from 'src/dtos/auth';
import { UsersService } from 'src/users/users.service';
import { IPayload, ITokens, IUserWithPaginate } from 'src/interfaces';
import * as dayjs from 'dayjs';
import { Roles } from 'src/auth/decorators';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    //     @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  /*****************************************************************************************
   * @desc	Get members
   * @route	GET, api/auth/users
   * @access	Public
   */
  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query('id') id?: string,
    @Query('first_name') first_name?: string,
    @Query('last_name') last_name?: string,
    @Query('email') email?: string,
    @Query('sortBy') sortBy: string = 'id',
    @Query('sortType') sortType: 'asc' | 'desc' = 'desc',
    @Query('pageNo', ParseIntPipe) pageNo: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
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
      ],
    };

    const users = await this.userService.findAll({
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      where,
      orderBy,
    });

    const total = await this.userService.findTotal({
      where,
    });

    const response: IUserWithPaginate = {
      total,
      users,
      pageNo,
      pageSize,
    };

    return response;
  }

  /*****************************************************************************************
   * @desc	Get members
   * @route	GET, api/auth/user
   * @access	Public
   */
  @Roles(RoleType.GUEST)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Get('users/:userId')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('userId') userId: string, @Req() req) {
    console.log('On controller', req.user);
    //     console.log(dayjs(Date.now()).format('DDMMYYYY-HHmmss-SSS'));

    const existUser = await this.userService.findUser({
      id: userId,
    });

    if (!existUser)
      throw new NotFoundException(`There is no user with id of ${userId}`);

    //     const roles = existUser.roles.map((role) => role.title);
    //     console.log(roles);

    return existUser;
  }

  /*****************************************************************************************
   * @desc	Register for new member
   * @route	POST, api/auth/register
   * @access	Public
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: Prisma.UserCreateInput) {
    const existUser = await this.userService.findUser({
      email: body.email,
    });

    if (existUser)
      throw new ConflictException('This an email or account already exists.');

    body.id = `uid-${dayjs(Date.now()).format('YYYYMMDD-HHmmss-SSS')}`;
    body.hash_password = await this.authService.hashedData(body.hash_password);

    return await this.authService.create({
      ...body,
      roles: {
        create: [
          {
            id: `rid-${dayjs(Date.now()).format('YYYYMMDD-HHmmss-SSS')}`,
            title: RoleType.EMPLOYEE,
          },
          {
            id: `rid-${dayjs(Date.now()).format('YYYYMMDD-HHmmss-SSS')}`,
            title: RoleType.ADMIN,
          },
        ],
      },
    });
  }

  /*****************************************************************************************
   * @desc	Register for new member
   * @route	POST, api/auth/register
   * @access	Public
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto): Promise<ITokens> {
    const existUser = await this.userService.findUser({
      email: body.email,
    });

    if (!existUser)
      throw new NotFoundException('An email or account not found');

    const pwdMatched = await this.authService.comparedData(
      body.password,
      existUser.hash_password,
    );

    if (!pwdMatched) throw new BadRequestException(`Password does not match`);

    const roles = existUser.roles.map((role) => role.title);
    //     console.log(roles);

    const payload: IPayload = {
      sub: existUser.id,
      email: existUser.email,
      roles: roles,
    };

    const { access_token, refresh_token } =
      await this.authService.getTokens(payload);

    await this.authService.updatedRefreshToken(existUser.id, refresh_token);

    return {
      access_token,
      refresh_token,
    };
  }
}
