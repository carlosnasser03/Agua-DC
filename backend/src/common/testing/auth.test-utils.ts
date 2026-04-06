/**
 * Authentication testing utilities
 * Provides helpers for JWT token generation, auth guards testing, etc.
 */

import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  iat?: number;
  exp?: number;
}

/**
 * Create a mock JWT token for testing
 */
export function createMockJwtToken(
  user: User | Partial<User>,
  jwtService: JwtService,
  expiresIn?: string,
): string {
  const payload: JwtPayload = {
    sub: user.id || '00000000-0000-0000-0000-000000000001',
    email: user.email || 'test@example.com',
    roleId: user.roleId || '00000000-0000-0000-0000-000000000100',
  };

  return jwtService.sign(payload, {
    expiresIn: expiresIn || '24h',
  });
}

/**
 * Decode and verify a JWT token
 */
export function verifyJwtToken(token: string, jwtService: JwtService): JwtPayload {
  return jwtService.verify(token) as JwtPayload;
}

/**
 * Create mock auth headers for HTTP requests
 */
export function createAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Create a mock device ID header for mobile requests
 */
export function createDeviceHeaders(deviceId: string): Record<string, string> {
  return {
    'x-device-id': deviceId,
  };
}

/**
 * Verify JWT guard mock setup
 */
export function setupJwtGuardMock() {
  return {
    canActivate: jest.fn(() => true),
  };
}

/**
 * Verify roles guard mock setup
 */
export function setupRolesGuardMock() {
  return {
    canActivate: jest.fn(() => true),
  };
}

/**
 * Create mock authenticated request context
 */
export function createMockAuthContext(user: Partial<User> = {}) {
  return {
    user: {
      id: user.id || '00000000-0000-0000-0000-000000000001',
      email: user.email || 'test@example.com',
      firstName: user.firstName || 'Test',
      lastName: user.lastName || 'User',
      roleId: user.roleId || '00000000-0000-0000-0000-000000000100',
    },
  };
}
