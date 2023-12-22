import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import { Role } from '@prisma/client';
import { IPayload, ITokens } from 'src/interfaces';
import { RoleTypes } from 'src/utils';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dbService: DatabaseService,
  ) {}

  /**********************************************************************
   * 	Update value on user table
   */
  async updateRefreshToken(userId: string, token: string) {
    const rtHash = await this.hashedData(token);

    return this.dbService.user.update({
      where: {
        id: userId,
      },
      data: {
        hash_refresh_token: rtHash,
      },
    });
  }

  /*******************************************************
   * 	Hash data
   */
  async hashedData(text: string): Promise<string> {
    return await bcrypt.hash(text, 10);
  }

  /*******************************************************
   * 	Decode and compared the data
   */
  async comparedData(data: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(data, hash);
  }

  /*******************************************************
   * 	Decode and compared the data
   */
  getPayload(sub: string, email: string, roles: Role[]): IPayload {
    const permissions = roles.map((role) => role.title as RoleTypes);

    return {
      sub,
      email,
      roles: permissions,
    };
  }

  /*******************************************************
   * 	Generate the access token and refresh token
   */
  async getTokens(payload: IPayload): Promise<ITokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_ACCESS_EXPIRE,
        secret: process.env.JWT_ACCESS_SECRET_KEY,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE,
        secret: process.env.JWT_REFRESH_SECRET_KEY,
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  /*******************************************************
   * 	Generate primary key with prefix + uuid version 4
   */
  getRandomPK(prefix: string): string {
    return `${prefix}-${uuid4()}`;
  }
}
