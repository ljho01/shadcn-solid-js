import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { createId } from './id';

describe('createId', () => {
  it('should return a deterministic ID when provided', () => {
    const id = createId('my-custom-id');
    expect(id).toBe('my-custom-id');
  });

  it('should generate unique IDs with radix- prefix', () => {
    createRoot((dispose) => {
      const id1 = createId();
      const id2 = createId();
      expect(id1).toMatch(/^radix-/);
      expect(id2).toMatch(/^radix-/);
      expect(id1).not.toBe(id2);
      dispose();
    });
  });

  it('should prefer deterministic ID over generated', () => {
    createRoot((dispose) => {
      const id = createId('deterministic');
      expect(id).toBe('deterministic');
      dispose();
    });
  });
});
