import { Test, TestingModule } from '@nestjs/testing';
import { DeviceAuthStrategy } from '../strategies/device.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('DeviceAuthStrategy', () => {
  let strategy: DeviceAuthStrategy;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceAuthStrategy,
        {
          provide: PrismaService,
          useValue: {
            deviceProfile: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    strategy = module.get<DeviceAuthStrategy>(DeviceAuthStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('authenticate', () => {
    // TODO: Test successful device UUID authentication
    // TODO: Test device profile creation on first auth
    // TODO: Test device profile update on subsequent auth
    // TODO: Test authentication with new UUID
    // TODO: Test payload generation with device info
  });

  describe('generateTokens', () => {
    // TODO: Test access token generation with device UUID
    // TODO: Test token format for device strategy
    // TODO: Test no refresh token (optional in response)
    // TODO: Test no expiration (stateless device auth)
  });

  describe('validateToken', () => {
    // TODO: Test valid device UUID validation
    // TODO: Test invalid UUID rejection
    // TODO: Test nonexistent device rejection
    // TODO: Test payload extraction from device
  });

  describe('refreshToken', () => {
    // TODO: Test device refresh (regenerate UUID or return same)
    // TODO: Test platform/appVersion update on refresh
  });

  describe('revokeToken', () => {
    // TODO: Test revoke by marking device inactive (optional)
  });

  describe('getStrategyName', () => {
    // TODO: Test strategy name returns 'DEVICE'
  });

  describe('getTokenExpiration', () => {
    // TODO: Test expiration returns 0 (no expiration for devices)
  });
});
