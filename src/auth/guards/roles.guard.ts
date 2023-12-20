import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    //     const roles = user.roles as RoleType[];
    console.log('On acc guard', user.roles, RoleType.ADMIN.toString());

    return requiredRoles.some((role) => user?.roles?.includes(role.toString()));
  }
}
