/**
 * React Native Testing Utilities
 * Provides helpers for component testing with React Native Testing Library
 */

import React from 'react';
import {
  render as rtlRender,
  RenderOptions,
} from '@testing-library/react-native';

/**
 * Custom render function with providers
 */
export function render(
  component: React.ReactElement,
  options?: RenderOptions,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  return rtlRender(component, {
    wrapper: Wrapper,
    ...options,
  });
}

/**
 * Create mock device UUID
 */
export const mockDeviceUuid = 'test-device-uuid-001';

/**
 * Setup device UUID in AsyncStorage
 */
export function setupDeviceUuid(uuid = mockDeviceUuid) {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  AsyncStorage.getItem.mockResolvedValue(uuid);
  AsyncStorage.setItem.mockResolvedValue(undefined);
}

/**
 * Create mock navigation prop
 */
export function createMockNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    reset: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn(() => true),
    addListener: jest.fn(() => jest.fn()),
  };
}

/**
 * Create mock route prop
 */
export function createMockRoute(params = {}) {
  return {
    key: 'test-key',
    name: 'TestScreen',
    params,
  };
}

/**
 * Create mock report object
 */
export function createMockReport(overrides = {}) {
  return {
    id: '00000000-0000-0000-0000-000000000300',
    deviceUuid: mockDeviceUuid,
    title: 'Water leak on Main Street',
    description: 'There is a water leak near the intersection',
    status: 'ENVIADO',
    colonyId: '00000000-0000-0000-0000-000000000400',
    colony: {
      id: '00000000-0000-0000-0000-000000000400',
      name: 'Test Colony',
    },
    latitude: 14.5994,
    longitude: -92.0669,
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-01-15').toISOString(),
    statusHistory: [],
    ...overrides,
  };
}

/**
 * Create mock schedule entry
 */
export function createMockScheduleEntry(overrides = {}) {
  return {
    id: '00000000-0000-0000-0000-000000000800',
    dayOfWeek: 'Monday',
    startTime: '08:00',
    endTime: '16:00',
    colony: {
      id: '00000000-0000-0000-0000-000000000400',
      name: 'Test Colony',
    },
    ...overrides,
  };
}

/**
 * Create mock colony
 */
export function createMockColony(overrides = {}) {
  return {
    id: '00000000-0000-0000-0000-000000000400',
    name: 'Test Colony',
    sector: {
      id: '00000000-0000-0000-0000-000000000500',
      name: 'Sector 1',
    },
    aliases: ['TC', 'TestCol'],
    scheduleEntries: [],
    ...overrides,
  };
}

/**
 * Mock API responses
 */
export const mockApiResponses = {
  getSchedules: () => ({
    data: [createMockScheduleEntry()],
  }),
  getReports: () => ({
    data: [createMockReport()],
  }),
  createReport: () => ({
    data: createMockReport(),
  }),
  getReportDetail: () => ({
    data: createMockReport(),
  }),
};

// Re-export testing library utilities
export * from '@testing-library/react-native';
