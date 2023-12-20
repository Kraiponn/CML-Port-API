import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { IPayload, ITokens } from 'src/interfaces';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/dtos/auth';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /********************************************
   * 	Get all accounts
   */
  async findAllAccount(): Promise<any | undefined> {
    //     return await this.userService.findAll();
  }

  /********************************************
   * 	Register for new member
   */
  async create(user: Prisma.UserCreateInput): Promise<any> {
    return await this.dbService.user.create({
      data: user,
    });
  }

  /********************************************
   * 	Login to get the authorized
   */
  async login(body: LoginDto): Promise<ITokens | undefined> {
    const existUser = await this.dbService.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!existUser)
      throw new NotFoundException('An email or account not found');

    const pwdMatched = await this.comparedData(
      body.password,
      existUser.hash_password,
    );

    if (!pwdMatched) throw new BadRequestException(`Password does not match`);

    const payload: IPayload = {
      sub: existUser.id,
      email: existUser.email,
      roles: ['admin'],
    };

    const tokens = await this.getTokens(payload);
    await this.updatedRefreshToken(existUser.id, tokens.refresh_token);

    return { ...tokens };
  }

  /********************************************
   * 	Edit password
   */
  async changePassword(
    userId: string,
    newPassword: string,
  ): Promise<ITokens | undefined> {
    const hash_password = await this.hashedData(newPassword);

    const user = await this.dbService.user.update({
      where: {
        id: userId,
      },
      data: {
        hash_password,
      },
    });

    if (!user) throw new BadRequestException();

    const payload: IPayload = {
      sub: user.id,
      email: user.email,
      roles: ['admin'],
    };

    const tokens = await this.getTokens(payload);
    await this.updatedRefreshToken(user.id, tokens.refresh_token);

    return { ...tokens };
  }

  /********************************************
   * 	Edit password
   */
  async editProfile(
    userId: string,
    body: Prisma.UserUpdateInput,
  ): Promise<ITokens | undefined> {
    const user = await this.dbService.user.update({
      where: {
        id: userId,
      },
      data: {
        ...body,
      },
    });

    if (!user) throw new BadRequestException();

    const payload: IPayload = {
      sub: user.id,
      email: user.email,
      roles: ['admin'],
    };

    const tokens = await this.getTokens(payload);
    await this.updatedRefreshToken(user.id, tokens.refresh_token);

    return { ...tokens };
  }

  /********************************************
   * 	Logout from service
   */
  async logout(userId: string): Promise<void> {
    await this.dbService.user.update({
      where: {
        id: userId,
        hash_refresh_token: { not: null },
      },
      data: {
        hash_refresh_token: null,
      },
    });
  }

  /********************************************
   * 	Request new tokens (access token, refresh token)
   */
  async refreshToken(userId: string): Promise<ITokens | undefined> {
    const existUser = await this.dbService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existUser) throw new NotFoundException('Account not found');

    const payload: IPayload = {
      sub: existUser.id,
      email: existUser.email,
      roles: ['admin'],
    };

    const tokens = await this.getTokens(payload);
    await this.updatedRefreshToken(existUser.id, tokens.refresh_token);

    return { ...tokens };
  }

  /**************************************************************************************
   * 									Helper Methods
   **************************************************************************************/
  async hashedData(text: string): Promise<string> {
    return await bcrypt.hash(text, 10);
  }

  async comparedData(data: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(data, hash);
  }

  async getTokens(payload: IPayload): Promise<ITokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_ACCESS_EXPIRE,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE,
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async updatedRefreshToken(id: string, token: string) {
    const hash_refresh_token = await this.hashedData(token);

    await this.dbService.user.update({
      where: { id },
      data: {
        hash_refresh_token,
      },
    });
  }
}
