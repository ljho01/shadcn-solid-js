/**
 * Shared test utilities for @radix-solid/* packages.
 */
export { render, cleanup, fireEvent, screen } from '@solidjs/testing-library';

/**
 * Wait for a condition to be true, with timeout.
 */
export function waitFor(
  callback: () => void | Promise<void>,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  const { timeout = 1000, interval = 50 } = options ?? {};
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = async () => {
      try {
        await callback();
        resolve();
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(error);
        } else {
          setTimeout(check, interval);
        }
      }
    };
    check();
  });
}
