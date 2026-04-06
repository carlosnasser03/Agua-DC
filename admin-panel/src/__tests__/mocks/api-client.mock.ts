/**
 * Mock API Client
 * Provides mock implementation of axios client for testing
 */

import { vi } from 'vitest';

export interface MockResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
}

export interface MockError<T = any> {
  response?: {
    status: number;
    data: T;
  };
  message: string;
}

/**
 * Create mock API client
 */
export function createMockApiClient() {
  return {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn(),
      },
      response: {
        use: vi.fn(),
        eject: vi.fn(),
      },
    },
  };
}

/**
 * Setup mock API response
 */
export function setupApiResponse<T>(
  apiClient: any,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  data: T,
  status = 200,
) {
  const mockResponse: MockResponse<T> = {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  };

  apiClient[method].mockResolvedValue(mockResponse);
}

/**
 * Setup mock API error
 */
export function setupApiError(
  apiClient: any,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  status: number,
  data: any = {},
) {
  const error: MockError = {
    response: {
      status,
      data,
    },
    message: `Request failed with status code ${status}`,
  };

  apiClient[method].mockRejectedValue(error);
}

/**
 * Mock API methods for common endpoints
 */
export function mockAuthEndpoints(apiClient: any) {
  // Mock login
  apiClient.post.mockImplementation((url: string, data: any) => {
    if (url.includes('/auth/login')) {
      return Promise.resolve({
        data: {
          access_token: 'mock-jwt-token',
          user: {
            id: '1',
            email: data.email,
            firstName: 'Test',
            lastName: 'User',
          },
        },
      });
    }
    return Promise.resolve({ data: {} });
  });
}

export function mockReportsEndpoints(apiClient: any) {
  // Mock get reports
  apiClient.get.mockImplementation((url: string) => {
    if (url.includes('/reports')) {
      return Promise.resolve({
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 20,
        },
      });
    }
    return Promise.resolve({ data: {} });
  });
}

export function mockSchedulesEndpoints(apiClient: any) {
  // Mock get schedules
  apiClient.get.mockImplementation((url: string) => {
    if (url.includes('/schedules')) {
      return Promise.resolve({
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 20,
        },
      });
    }
    return Promise.resolve({ data: {} });
  });
}
