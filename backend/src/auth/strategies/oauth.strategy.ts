/**
 * © 2026 AguaDC - Propiedad Privada.
 * Stub para OAuth strategy (Google, Microsoft, etc.)
 */
import { Injectable, NotImplementedException } from '@nestjs/common';
import { IAuthStrategy, IAuthPayload, IAuthCredentials, IAuthTokens } from '../interfaces/IAuthStrategy';

/**
 * OAuthAuthStrategy - Placeholder for OAuth authentication
 * Future implementation: Google, Microsoft, GitHub, etc.
 */
@Injectable()
export class OAuthAuthStrategy implements IAuthStrategy {
  async authenticate(credentials: IAuthCredentials): Promise<IAuthPayload> {
    throw new NotImplementedException('OAuth strategy not yet implemented. Coming soon!');
  }

  async generateTokens(payload: IAuthPayload): Promise<IAuthTokens> {
    throw new NotImplementedException('OAuth strategy not yet implemented');
  }

  async validateToken(token: string): Promise<IAuthPayload> {
    throw new NotImplementedException('OAuth strategy not yet implemented');
  }

  async refreshToken(token: string): Promise<IAuthTokens> {
    throw new NotImplementedException('OAuth strategy not yet implemented');
  }

  async revokeToken(token: string): Promise<void> {
    throw new NotImplementedException('OAuth strategy not yet implemented');
  }

  getStrategyName(): string {
    return 'OAUTH';
  }

  getTokenExpiration(): number {
    return 7 * 24 * 60 * 60 * 1000; // 7 days
  }
}
