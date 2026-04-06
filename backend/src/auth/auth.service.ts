/**
 * © 2026 AguaDC - Propiedad Privada.
 * AuthService refactored to use pluggable IAuthStrategy implementations
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { IAuthStrategy, IAuthCredentials, IAuthTokens } from './interfaces/IAuthStrategy';

/**
 * AuthService - Strategy Router
 * Routes authentication to the appropriate strategy implementation
 * - No hardcoded authentication logic
 * - Supports JWT, OAuth (stub), Device strategies
 * - Easy to add new strategies without modifying this class (OCP principle)
 */
@Injectable()
export class AuthService {
  constructor(private strategies: Map<string, IAuthStrategy>) {}

  /**
   * Authenticate user using specified strategy
   * @param strategyName - Strategy to use (jwt, oauth, device)
   * @param credentials - Strategy-specific credentials
   */
  async login(strategyName: string, credentials: IAuthCredentials) {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new BadRequestException(`Unknown authentication strategy: ${strategyName}`);
    }

    const payload = await strategy.authenticate(credentials);
    const tokens = await strategy.generateTokens(payload);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_in: tokens.expiresIn,
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      },
    };
  }

  /**
   * Validate a token using the appropriate strategy
   * @param strategyName - Strategy that issued the token
   * @param token - Token to validate
   */
  async validateToken(strategyName: string, token: string) {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new BadRequestException(`Unknown authentication strategy: ${strategyName}`);
    }

    return strategy.validateToken(token);
  }

  /**
   * Refresh a token using the appropriate strategy
   * @param strategyName - Strategy that issued the token
   * @param user - Authenticated user object
   */
  async refreshToken(strategyName: string, user: any): Promise<IAuthTokens> {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new BadRequestException(`Unknown authentication strategy: ${strategyName}`);
    }

    // Convert user object/req.user to IAuthPayload
    const payload = {
      sub: user.id || user.userId || user.sub,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    };

    return strategy.generateTokens(payload);
  }

  /**
   * Get list of available strategies
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}
