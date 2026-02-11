/**
 * SolidJS equivalent of React's useEffectEvent (experimental).
 *
 * In SolidJS, closures don't have the stale-closure problem that React has,
 * so this is essentially a thin wrapper. The function always calls the latest
 * version of the callback without needing to track it in a ref.
 *
 * We keep this utility for API compatibility with components ported from React
 * that depend on `useEffectEvent`.
 */

/**
 * Creates a stable function reference that always calls the latest callback.
 * In SolidJS, this is trivially implemented since closures over signals
 * always read the latest value.
 */
export function createEffectEvent<T extends (...args: any[]) => any>(fn: T): T {
  // In SolidJS, the function will naturally close over reactive values
  // and always access the latest values when called.
  // We simply return the function as-is.
  // This differs from React where refs are needed to avoid stale closures.
  let latestFn = fn;

  // Update the reference if the function changes
  // This handles the case where the function itself is recreated
  const stableRef = ((...args: any[]) => {
    return latestFn(...args);
  }) as T;

  // In SolidJS, we can use a simple pattern to keep the ref updated
  // The caller can pass a new function and it will be used on next call
  (stableRef as any).__update = (newFn: T) => {
    latestFn = newFn;
  };

  return stableRef;
}

/**
 * Alternative simpler version - just returns the function directly.
 * In SolidJS, this is all you need since there's no stale closure issue
 * when accessing signals inside the callback.
 */
export function useEffectEvent<T extends (...args: any[]) => any>(fn: T): T {
  return fn;
}
