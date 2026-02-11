import { describe, it, expect } from 'vitest';
import { createPrevious } from './use-previous';
import { createSignal, createRoot } from 'solid-js';

describe('createPrevious', () => {
  it('should export createPrevious function', () => {
    expect(typeof createPrevious).toBe('function');
  });

  it('should return current value initially', () => {
    createRoot((dispose) => {
      const [value] = createSignal(5);
      const prev = createPrevious(value);
      expect(prev()).toBe(5);
      dispose();
    });
  });

  it('should track previous value after change', () => {
    createRoot((dispose) => {
      const [value, setValue] = createSignal(1);
      const prev = createPrevious(value);

      expect(prev()).toBe(1);

      setValue(2);
      // After reactive update, previous should be 1
      // Note: In synchronous context, createComputed runs synchronously
      expect(prev()).toBe(1);

      setValue(3);
      expect(prev()).toBe(2);

      dispose();
    });
  });

  it('should not update previous when value is the same', () => {
    createRoot((dispose) => {
      const [value, setValue] = createSignal(1);
      const prev = createPrevious(value);

      setValue(1); // Same value
      expect(prev()).toBe(1);

      dispose();
    });
  });
});
