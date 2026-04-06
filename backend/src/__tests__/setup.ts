/**
 * Global test setup for Jest
 * Configures test environment, mocks, and utilities
 */

// Suppress console output during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';
process.env.JWT_EXPIRATION = '24h';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/aguadc_test';

// Increase timeout for database operations in CI
if (process.env.CI) {
  jest.setTimeout(30000);
}

export {};
