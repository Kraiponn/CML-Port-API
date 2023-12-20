import { Profile, ProfileImage, Role, User } from '@prisma/client';

type CaseSensitiveType = 'default' | 'insensitive';

export type IProfileWithRelate = Profile & ProfileImage[];

export interface IUserWithRelate {
  user: User;
  roles: Role[];
  profiles: IProfileWithRelate;
}

export interface IUserWithPaginate {
  total: number;
  pageNo: number;
  pageSize: number;
  users: User[];
}

export interface IFilterWithMode {
  startsWith: string;
  mode: CaseSensitiveType;
}

export interface IUserFilter {
  id: IFilterWithMode;
  first_name: IFilterWithMode;
  last_name: IFilterWithMode;
  email: IFilterWithMode;
}
