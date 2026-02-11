import { describe, it, expect } from 'vitest';
import { createElementRect } from './use-rect';
import { createRoot } from 'solid-js';

describe('createElementRect', () => {
  it('should export createElementRect function', () => {
    expect(typeof createElementRect).toBe('function');
  });

  it('should return undefined for null element', () => {
    createRoot((dispose) => {
      const rect = createElementRect(() => null);
      expect(rect()).toBeUndefined();
      dispose();
    });
  });
});
