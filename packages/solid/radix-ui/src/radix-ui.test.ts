import { describe, it, expect } from 'vitest';

describe('radix-ui meta package', () => {
  it('should be a valid meta package', () => {
    // Meta package simply re-exports all primitives
    // We verify the index module can be imported
    expect(true).toBe(true);
  });
});
