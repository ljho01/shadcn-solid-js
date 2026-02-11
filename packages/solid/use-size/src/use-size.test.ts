import { describe, it, expect } from 'vitest';
import { createElementSize } from './use-size';
import { createRoot } from 'solid-js';

describe('createElementSize', () => {
  it('should export createElementSize function', () => {
    expect(typeof createElementSize).toBe('function');
  });

  it('should return undefined for null element', () => {
    createRoot((dispose) => {
      const size = createElementSize(() => null);
      expect(size()).toBeUndefined();
      dispose();
    });
  });
});
