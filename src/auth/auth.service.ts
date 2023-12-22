import { Prisma, User } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { AdminService } from 'src/admin/admin.service';
import { UsersService } from 'src/users/users.service';
import { RoleTypes } from 'src/utils';
import { ITokens, IUserWithRoles } from 'src/interfaces';
import { LoginDto } from 'src/dtos/user';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly userService: UsersService,
    private readonly adminService: AdminService,
  ) {}

  /**********************************************************************
   * 	Register new account
   */
  async signup(
    dto: Prisma.UserCreateInput,
  ): Promise<IUserWithRoles | undefined> {
    const existUser = await this.userService.findOneAsync({
      email: dto.email,
    });

    if (existUser)
      throw new ConflictException('This an email or account already exists.');

    dto.id = this.adminService.getRandomPK('uid');
    dto.hash_password = await this.adminService.hashedData(dto.hash_password);

    return await this.dbService.user.create({
      data: {
        ...dto,
        roles: {
          create: [
            {
              id: this.adminService.getRandomPK('rid'),
              title: RoleTypes.MEMBER,
            },
          ],
        },
      },
      include: {
        roles: true,
      },
    });
  }

  /**********************************************************************
   * 	Login to get an authorization
   */
  async signin(dto: LoginDto): Promise<ITokens> {
    const existUser = await this.userService.findOneAsync({
      email: dto.email,
    });

    if (!existUser)
      throw new NotFoundException('An email or account not found');

    const pwdMatched = await this.adminService.comparedData(
      dto.password,
      existUser.hash_password,
    );

    if (!pwdMatched) throw new BadRequestException(`Password does not match`);

    const payload = this.adminService.getPayload(
      existUser.id,
      existUser.email,
      existUser.roles,
    );

    // Generated an access token and refresh
    const { access_token, refresh_token } =
      await this.adminService.getTokens(payload);

    // Update hash_refresh_token field on user table
    await this.adminService.updateRefreshToken(existUser.id, refresh_token);

    return {
      access_token,
      refresh_token,
    };
  }

  /**********************************************************************
   * 	Logout from the service
   */
  async signout(userId: string): Promise<User | undefined> {
    return this.dbService.user.update({
      where: {
        id: userId,
        hash_refresh_token: { not: null },
      },
      data: {
        hash_refresh_token: null,
      },
    });
  }

  /**********************************************************************
   * 	Request the new refresh token
   */
  async getRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<ITokens> {
    const existUser = await this.userService.findOneAsync({ id: userId });

    if (!existUser || !existUser.hash_refresh_token)
      throw new ForbiddenException('Access denied');

    const refreshTokenMatches = await this.adminService.comparedData(
      refreshToken,
      existUser.hash_refresh_token,
    );

    if (!refreshTokenMatches) throw new ForbiddenException('Access denied 2');

    const payload = this.adminService.getPayload(
      existUser.id,
      existUser.email,
      existUser.roles,
    );

    // Generated an access token and refresh
    const { access_token, refresh_token } =
      await this.adminService.getTokens(payload);

    // Update hash_refresh_token field on user table
    await this.adminService.updateRefreshToken(existUser.id, refresh_token);

    return {
      access_token,
      refresh_token,
    };
  }
}
