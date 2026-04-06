import { IAuthCredentials } from './auth-credentials.interface';
import { IAuthPayload } from './auth-payload.interface';
import { IAuthTokens } from './auth-tokens.interface';

/**
 * IAuthStrategy - Interface for pluggable authentication strategies
 * Allows support for JWT, OAuth, Device-based auth, SAML, etc.
 */
export interface IAuthStrategy {
  /**
   * Authenticate user/device with provided credentials
   * @param credentials - Auth credentials (email/password, device UUID, OAuth token, etc.)
   * @returns Authenticated payload with user/device info
   */
  authenticate(credentials: IAuthCredentials): Promise<IAuthPayload>;

  /**
   * Generate tokens from an authenticated payload
   * @param payload - Authenticated user/device payload
   * @returns Token response with access/refresh tokens
   */
  generateTokens(payload: IAuthPayload): Promise<IAuthTokens>;

  /**
   * Validate an existing token
   * @param token - Token string to validate
   * @returns Payload if valid, throws error if invalid
   */
  validateToken(token: string): Promise<IAuthPayload>;

  /**
   * Refresh authentication tokens
   * @param token - Refresh/access token to refresh
   * @returns New token pair
   */
  refreshToken(token: string): Promise<IAuthTokens>;

  /**
   * Revoke a token (if supported by strategy)
   * @param token - Token to revoke
   */
  revokeToken(token: string): Promise<void>;

  /**
   * Get the name of this auth strategy
   * @returns Strategy name (e.g., 'JWT', 'OAUTH', 'DEVICE')
   */
  getStrategyName(): string;

  /**
   * Get token expiration time in seconds
   * @returns Expiration duration in seconds
   */
  getTokenExpiration(): number;
}
