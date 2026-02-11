import { createSignal, createComputed } from 'solid-js';

/**
 * Tracks the previous value of a reactive expression.
 * SolidJS equivalent of React's usePrevious.
 *
 * @example
 * ```ts
 * const [count, setCount] = createSignal(0);
 * const prevCount = createPrevious(() => count());
 * // prevCount() returns the previous value of count
 * ```
 */
function createPrevious<T>(value: () => T): () => T {
  const [current, setCurrent] = createSignal<T>(value());
  const [previous, setPrevious] = createSignal<T>(value());

  createComputed(() => {
    const newValue = value();
    const currentValue = current();
    if (newValue !== currentValue) {
      setPrevious(() => currentValue);
      setCurrent(() => newValue);
    }
  });

  return previous;
}

export { createPrevious };
