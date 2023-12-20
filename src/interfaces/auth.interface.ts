export interface IPayload {
  sub: string;
  email: string;
  roles: string[];
}

export interface ITokens {
  access_token: string;
  refresh_token: string;
}

export type IPayloadWithRefreshToken = IPayload & { refresh_token: string };
