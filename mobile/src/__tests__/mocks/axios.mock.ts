/**
 * Mock Axios Client
 * Provides mock implementation of axios for React Native testing
 */

export const mockAxiosClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
};

/**
 * Setup mock axios response
 */
export function setupAxiosResponse<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  data: T,
  status = 200,
) {
  mockAxiosClient[method].mockResolvedValue({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  });
}

/**
 * Setup mock axios error
 */
export function setupAxiosError(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  status: number,
  data: any = {},
) {
  mockAxiosClient[method].mockRejectedValue({
    response: {
      status,
      data,
    },
    message: `Request failed with status code ${status}`,
  });
}

/**
 * Reset all mock calls
 */
export function resetAxiosMocks() {
  Object.keys(mockAxiosClient).forEach((key) => {
    if (typeof mockAxiosClient[key].mockClear === 'function') {
      mockAxiosClient[key].mockClear();
    }
  });
}

/**
 * Mock AsyncStorage
 */
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
};

/**
 * Setup AsyncStorage mock value
 */
export function setupAsyncStorageValue(key: string, value: string | null) {
  mockAsyncStorage.getItem.mockImplementation((k: string) =>
    k === key ? Promise.resolve(value) : Promise.resolve(null),
  );
}

/**
 * Reset AsyncStorage mock
 */
export function resetAsyncStorageMocks() {
  mockAsyncStorage.getItem.mockReset();
  mockAsyncStorage.setItem.mockReset();
  mockAsyncStorage.removeItem.mockReset();
  mockAsyncStorage.clear.mockReset();
}
