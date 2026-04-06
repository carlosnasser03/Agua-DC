/**
 * © 2026 AguaDC - Propiedad Privada.
 * Device-based authentication para mobile app (sin login requerido)
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IAuthStrategy, IAuthPayload, IAuthCredentials, IAuthTokens } from '../interfaces/IAuthStrategy';

/**
 * DeviceAuthStrategy - Anonymous device-based authentication for mobile
 * Citizens identify themselves via device UUID, no password required
 */
@Injectable()
export class DeviceAuthStrategy implements IAuthStrategy {
  constructor(private prisma: PrismaService) {}

  async authenticate(credentials: IAuthCredentials): Promise<IAuthPayload> {
    if (!credentials.deviceUuid) {
      throw new BadRequestException('Device UUID is required');
    }

    const deviceProfile = await this.prisma.deviceProfile.upsert({
      where: { deviceUuid: credentials.deviceUuid },
      update: { lastSeenAt: new Date() },
      create: {
        deviceUuid: credentials.deviceUuid,
        platform: credentials.platform,
        appVersion: credentials.appVersion,
      },
    });

    return {
      sub: deviceProfile.deviceUuid,
      email: `device-${deviceProfile.deviceUuid}@aguadc.local`,
      role: 'CITIZEN',
      permissions: ['reports:create', 'reports:read:own', 'schedules:read'],
    };
  }

  async generateTokens(payload: IAuthPayload): Promise<IAuthTokens> {
    // For device strategy, the deviceUuid IS the token
    // No JWT generation needed
    return {
      accessToken: payload.sub,
      expiresIn: undefined, // Device tokens don't expire
    };
  }

  async validateToken(token: string): Promise<IAuthPayload> {
    const deviceProfile = await this.prisma.deviceProfile.findUnique({
      where: { deviceUuid: token },
    });

    if (!deviceProfile) {
      throw new BadRequestException('Invalid device token');
    }

    return {
      sub: deviceProfile.deviceUuid,
      email: `device-${deviceProfile.deviceUuid}@aguadc.local`,
      role: 'CITIZEN',
      permissions: ['reports:create', 'reports:read:own', 'schedules:read'],
    };
  }

  async refreshToken(token: string): Promise<IAuthTokens> {
    // Device tokens don't need refreshing
    return this.generateTokens(await this.validateToken(token));
  }

  async revokeToken(token: string): Promise<void> {
    // Could delete device profile, but we prefer to keep it for history
    // Optional: mark as revoked in database
  }

  getStrategyName(): string {
    return 'DEVICE';
  }

  getTokenExpiration(): number {
    return 0; // No expiration for device tokens
  }
}
