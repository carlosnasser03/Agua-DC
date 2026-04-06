/**
 * Admin Panel Testing Utilities
 * Provides helpers for component testing with React Testing Library
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Mock API Client
 */
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

/**
 * Custom render function with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {}

export function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock auth token
 */
export const mockAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlSWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAxMDAiLCJpYXQiOjE2NDY0MzIwMDAsImV4cCI6MTY0NjUxODQwMH0.xyz';

/**
 * Setup auth context/token in localStorage
 */
export function setupAuthToken() {
  localStorage.setItem('aguadc_token', mockAuthToken);
}

/**
 * Clear auth context/token from localStorage
 */
export function clearAuthToken() {
  localStorage.removeItem('aguadc_token');
}

/**
 * Create mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: {
      id: '00000000-0000-0000-0000-000000000100',
      name: 'Admin',
    },
    ...overrides,
  };
}

/**
 * Create mock report object
 */
export function createMockReport(overrides = {}) {
  return {
    id: '00000000-0000-0000-0000-000000000300',
    deviceUuid: 'device-uuid-001',
    title: 'Water leak on Main Street',
    description: 'There is a water leak near the intersection',
    status: 'ENVIADO',
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
 * Create mock schedule object
 */
export function createMockSchedule(overrides = {}) {
  return {
    id: '00000000-0000-0000-0000-000000000600',
    title: 'Spring 2026 Schedule',
    status: 'PUBLISHED',
    uploadedAt: new Date('2026-01-01').toISOString(),
    publishedAt: new Date('2026-01-05').toISOString(),
    periods: [],
    ...overrides,
  };
}

/**
 * Async wait utility
 */
export async function waitFor(callback: () => void, options = {}) {
  const { timeout = 1000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      callback();
      return;
    } catch {
      // Retry
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('waitFor timeout exceeded');
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
