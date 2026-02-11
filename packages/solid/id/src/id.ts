import { createUniqueId } from 'solid-js';

/**
 * Creates a unique ID for use in accessibility attributes.
 * Wraps SolidJS's `createUniqueId()` with optional deterministic ID support.
 *
 * In React's Radix, this was `useId()`. In SolidJS we use `createUniqueId()`
 * which is already SSR-safe.
 *
 * @param deterministicId - If provided, returns this ID directly.
 * @returns A unique ID string prefixed with "radix-".
 */
function createId(deterministicId?: string): string {
  if (deterministicId) return deterministicId;
  return `radix-${createUniqueId()}`;
}

export { createId };
