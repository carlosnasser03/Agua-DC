/**
 * © 2026 AguaDC - AuthModule with pluggable strategies
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthStrategy } from './strategies/jwt.strategy';
import { OAuthAuthStrategy } from './strategies/oauth.strategy';
import { DeviceAuthStrategy } from './strategies/device.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

/**
 * AuthModule
 * Provides pluggable authentication strategies
 * - JwtAuthStrategy: Admin panel with email/password
 * - OAuthAuthStrategy: Future OAuth integration (stub)
 * - DeviceAuthStrategy: Mobile app with device UUID
 */
@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default_secret',
        signOptions: { expiresIn: (configService.get<string>('JWT_EXPIRATION') || '24h') as any },
      }),
    }),
  ],
  providers: [
    // Strategy implementations
    JwtAuthStrategy,
    OAuthAuthStrategy,
    DeviceAuthStrategy,
    // Passport strategy for decorator-based validation
    JwtStrategy,
    // Auth service (routes to strategies)
    AuthService,
    // Factory to create Map<string, IAuthStrategy>
    {
      provide: 'AuthStrategies',
      useFactory: (jwt: JwtAuthStrategy, oauth: OAuthAuthStrategy, device: DeviceAuthStrategy) =>
        new Map([
          ['jwt', jwt],
          ['oauth', oauth],
          ['device', device],
        ]),
      inject: [JwtAuthStrategy, OAuthAuthStrategy, DeviceAuthStrategy],
    },
    // Provide Map to AuthService via useFactory
    {
      provide: AuthService,
      useFactory: (strategiesMap: Map<string, any>) => new AuthService(strategiesMap),
      inject: ['AuthStrategies'],
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthStrategy],
})
export class AuthModule {}
