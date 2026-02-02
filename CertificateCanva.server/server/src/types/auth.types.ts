export interface LoginDTO {
  email: string;
  password: string;
}

export interface TokenPayload {
  id: string;
  role?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}