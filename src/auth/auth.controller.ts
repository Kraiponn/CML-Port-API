import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Prisma, User } from '@prisma/client';
import { LoginDto } from 'src/dtos/user';
import { ITokens, IUserWithRoles } from 'src/interfaces';
import { GetTokenPayload, GetUserId, Public } from 'src/auth/decorators';
import { JwtAccessGuard } from 'src/auth/guards';
import { JwtRefreshGuard } from 'src/auth/guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*****************************************************************************************
   * @desc	Register for new member
   * @route	POST, api/auth/register
   * @access	Public
   */
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() body: Prisma.UserCreateInput,
  ): Promise<IUserWithRoles> {
    const result = await this.authService.signup(body);

    if (!result) throw new BadRequestException();

    return result;
  }

  /*****************************************************************************************
   * @desc	Login to get an authorization
   * @route	POST, api/auth/login
   * @access	Private
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: LoginDto): Promise<ITokens> {
    return await this.authService.signin(body);
  }

  /*****************************************************************************************
   * @desc	Logout from the system
   * @route	GET, api/auth/logout
   * @access	Private
   */
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Get('logout')
  async logout(@GetUserId() userId: string): Promise<User | undefined> {
    return await this.authService.signout(userId);
  }

  /*****************************************************************************************
   * @desc	Request the new tokens => access token and refresh token
   * @route	GET, api/auth/refresh-token
   * @access	Private
   */
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(
    @GetUserId() userId: string,
    @GetTokenPayload('refresh_token') refreshToken: string,
  ): Promise<ITokens> {
    return await this.authService.getRefreshToken(userId, refreshToken);
  }
}
