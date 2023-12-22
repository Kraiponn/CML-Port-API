import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IPayload } from 'src/interfaces';

export const GetUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user as IPayload;

    return user.sub;
  },
);
