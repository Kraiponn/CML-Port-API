import { ProfileImage, Role, User } from '@prisma/client';

export type IProfileImages = { profile_images: ProfileImage[] };
export type IRole = { roles: Role[] };
export type IUserWithRoles = User & IRole;
export type IUserWithRelate = User & IProfileImages & IRole;

export interface IUserWithPaginate {
  total: number;
  pageNo: number;
  pageSize: number;
  users: User[];
}
