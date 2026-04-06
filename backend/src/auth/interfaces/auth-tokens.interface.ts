/**
 * IAuthTokens - Token response from auth strategies
 * Contains access/refresh tokens and expiration info
 */
export interface IAuthTokens {
  accessToken: string;          // Access token (JWT or device UUID)
  refreshToken?: string;        // Refresh token (optional, for JWT)
  expiresIn?: number;           // Token expiration in seconds
  tokenType?: string;           // Token type (e.g., 'Bearer')
}
