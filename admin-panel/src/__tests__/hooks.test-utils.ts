/**
 * React Hook Testing Utilities
 * Provides helpers for testing custom React hooks
 */

import { renderHook, act, RenderHookOptions } from '@testing-library/react';
import { ReactNode } from 'react';

/**
 * Wrapper for hooks that may need context providers
 */
export function createHookWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return children;
  };
}

/**
 * Custom render hook function with default options
 */
export function renderTestHook<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps>,
) {
  return renderHook(hook, {
    wrapper: createHookWrapper(),
    ...options,
  });
}

/**
 * Helper for async hook operations
 */
export async function actAsync(callback: () => Promise<void>) {
  return act(async () => {
    await callback();
  });
}

/**
 * Mock hook result type
 */
export interface MockHookResult<T> {
  current: T;
  rerender: (props?: any) => void;
  unmount: () => void;
}

/**
 * Create mock hook state
 */
export function createMockHookState<T>(initialValue: T) {
  let value = initialValue;
  return {
    getValue: () => value,
    setValue: (newValue: T) => {
      value = newValue;
    },
    reset: () => {
      value = initialValue;
    },
  };
}

/**
 * Wait for hook update
 */
export async function waitForHookUpdate(
  callback: () => void,
  timeout = 1000,
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      callback();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error('Hook update timeout');
}
