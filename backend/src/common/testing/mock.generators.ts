/**
 * Mock object generators for testing
 * Provides factory functions for creating test data
 */

import { User, Role, Permission, Report, ReportStatus, Colony, Sector, Schedule, SchedulePeriod } from '@prisma/client';

/**
 * Generate a mock User object
 */
export function generateMockUser(overrides?: Partial<User>): User {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    passwordHash: '$2b$10$hashedpassword',
    isActive: true,
    roleId: '00000000-0000-0000-0000-000000000100',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    lastLogin: null,
    ...overrides,
  };
}

/**
 * Generate a mock Role object
 */
export function generateMockRole(overrides?: Partial<Role>): Role {
  return {
    id: '00000000-0000-0000-0000-000000000100',
    name: 'Admin',
    description: 'Administrator role',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

/**
 * Generate a mock Permission object
 */
export function generateMockPermission(overrides?: Partial<Permission>): Permission {
  return {
    id: '00000000-0000-0000-0000-000000000200',
    name: 'view_reports',
    description: 'View citizen reports',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

/**
 * Generate a mock Report object
 */
export function generateMockReport(overrides?: Partial<Report>): Report {
  return {
    id: '00000000-0000-0000-0000-000000000300',
    deviceUuid: 'device-uuid-001',
    colonyId: '00000000-0000-0000-0000-000000000400',
    title: 'Water leak on Main Street',
    description: 'There is a water leak near the intersection',
    status: ReportStatus.ENVIADO,
    latitude: 14.5994,
    longitude: -92.0669,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    resolvedAt: null,
    resolutionNotes: null,
    ...overrides,
  };
}

/**
 * Generate a mock Colony object
 */
export function generateMockColony(overrides?: Partial<Colony>): Colony {
  return {
    id: '00000000-0000-0000-0000-000000000400',
    name: 'Test Colony',
    sectorId: '00000000-0000-0000-0000-000000000500',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

/**
 * Generate a mock Sector object
 */
export function generateMockSector(overrides?: Partial<Sector>): Sector {
  return {
    id: '00000000-0000-0000-0000-000000000500',
    name: 'Sector 1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

/**
 * Generate a mock Schedule object
 */
export function generateMockSchedule(overrides?: Partial<Schedule>): Schedule {
  return {
    id: '00000000-0000-0000-0000-000000000600',
    title: 'Spring 2026 Schedule',
    status: 'PUBLISHED',
    uploadedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-05'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-05'),
    ...overrides,
  };
}

/**
 * Generate a mock SchedulePeriod object
 */
export function generateMockSchedulePeriod(overrides?: Partial<SchedulePeriod>): SchedulePeriod {
  return {
    id: '00000000-0000-0000-0000-000000000700',
    scheduleId: '00000000-0000-0000-0000-000000000600',
    periodNumber: 1,
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-02-28'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

/**
 * Generate multiple mock objects
 */
export function generateMockArray<T>(
  generator: (overrides?: Partial<T>) => T,
  count: number,
  overridesArray?: Partial<T>[],
): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(generator(overridesArray?.[i]));
  }
  return result;
}
