import { IsArray, IsEnum } from 'class-validator';
import { RoleTypes } from 'src/utils';

export class UserUpdateRolesDto {
  @IsArray()
  @IsEnum(RoleTypes, { each: true })
  roles: RoleTypes[];
}
