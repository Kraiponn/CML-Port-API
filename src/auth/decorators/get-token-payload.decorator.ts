import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IPayloadWithRefreshToken } from 'src/interfaces';
import { RoleTypes } from 'src/utils';

export const GetTokenPayload = createParamDecorator(
  (
    requiredProp: keyof IPayloadWithRefreshToken | undefined,
    ctx: ExecutionContext,
  ): string | RoleTypes[] => {
    const { user } = ctx.switchToHttp().getRequest();

    if (!requiredProp) {
      return user;
    }

    return user[requiredProp];
  },
);
