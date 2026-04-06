/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */

/**
 * IAuthPayload
 * Core information returned after successful authentication
 * Passed to token generation and stored in JWT claims
 */
export interface IAuthPayload {
  sub: string;              // User ID or device UUID
  email: string;            // Email address or device identifier
  role: string;             // Role name (e.g., 'Super Admin', 'CITIZEN')
  permissions: string[];    // Array of permissions (e.g., 'reports:create', 'users:manage')
}

/**
 * IAuthCredentials
 * Input credentials for authentication
 * Extensible to support different strategies
 */
export interface IAuthCredentials {
  email?: string;           // For JWT strategy
  password?: string;        // For JWT strategy
  deviceUuid?: string;      // For device strategy
  oauthToken?: string;      // For OAuth strategy
  [key: string]: any;       // Allow strategy-specific fields
}

/**
 * IAuthTokens
 * Output tokens after successful authentication
 */
export interface IAuthTokens {
  accessToken: string;      // JWT or device UUID or token
  refreshToken?: string;    // Optional refresh token
  expiresIn?: number;       // Token expiration in seconds
}

/**
 * IAuthStrategy
 * Pluggable authentication strategy interface
 * Implementations: JWT, OAuth, Device, etc.
 *
 * Enables:
 * - Open/Closed Principle: New strategies without changing AuthService
 * - Liskov Substitution: All strategies are interchangeable
 * - Dependency Inversion: AuthService depends on interface, not implementation
 */
export interface IAuthStrategy {
  /**
   * Authenticate user with given credentials
   * @param credentials - Strategy-specific credentials
   * @returns Authentication payload with user info
   */
  authenticate(credentials: IAuthCredentials): Promise<IAuthPayload>;

  /**
   * Generate tokens from authenticated payload
   * @param payload - User information from authenticate()
   * @returns Tokens for client use
   */
  generateTokens(payload: IAuthPayload): Promise<IAuthTokens>;

  /**
   * Validate token and extract payload
   * @param token - Token to validate
   * @returns Payload if valid
   */
  validateToken(token: string): Promise<IAuthPayload>;

  /**
   * Refresh an existing token
   * @param token - Current token to refresh
   * @returns New tokens
   */
  refreshToken(token: string): Promise<IAuthTokens>;

  /**
   * Revoke a token (optional, depends on strategy)
   * @param token - Token to revoke
   */
  revokeToken(token: string): Promise<void>;

  /**
   * Get human-readable strategy name
   * @returns Strategy name (e.g., 'JWT', 'OAuth', 'DEVICE')
   */
  getStrategyName(): string;

  /**
   * Get token expiration time in milliseconds
   * @returns Expiration time
   */
  getTokenExpiration(): number;
}
