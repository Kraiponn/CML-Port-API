import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { IPayload, IPayloadWithRefreshToken } from 'src/interfaces';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET_KEY,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: IPayload,
  ): Promise<IPayloadWithRefreshToken> {
    console.log('On validate refresh token: ', payload);
    const refresh_token = req.headers.authorization.split(' ')[1];

    return { ...payload, refresh_token };
  }
}
