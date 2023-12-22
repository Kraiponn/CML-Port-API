import { RoleTypes } from 'src/utils';

export interface IPayload {
  sub: string;
  email: string;
  roles: RoleTypes[];
}

export interface ITokens {
  access_token: string;
  refresh_token: string;
}

export type IPayloadWithRefreshToken = IPayload & { refresh_token: string };
