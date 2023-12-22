import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators';
import { RolesGuard } from 'src/auth/guards';
import { UserUpdateRolesDto } from 'src/dtos/user';
import { UsersService } from 'src/users/users.service';
import { RoleTypes } from 'src/utils';
import { AdminService } from 'src/admin/admin.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly userService: UsersService,
    private readonly adminService: AdminService,
  ) {}

  /*****************************************************************************************
   * @desc	Add or Edit Roles
   * @route	PATCH, api/admin/users/:userId/roles
   * @access	Private - Only admin or manager roles
   */
  @Roles(RoleTypes.MANAGER, RoleTypes.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('users/:userId/roles')
  async editOrAddRoles(
    @Param('userId') userId: string,
    @Body() dto: UserUpdateRolesDto,
  ): Promise<any> {
    // Remove old roles from user
    const result = await this.userService.editAsync(
      { id: userId },
      { roles: { deleteMany: {} } },
    );

    if (!result) throw new BadRequestException();

    const fieldToUpdate = dto.roles.map((role) => {
      return {
        id: this.adminService.getRandomPK('rid'),
        title: role,
      };
    });

    // Update new roles to user
    const userWithRelate = await this.userService.editAsync(
      { id: userId },
      {
        roles: {
          create: fieldToUpdate,
        },
      },
    );

    return userWithRelate;
  }
}
