import { describe, it, expect } from 'vitest';
import { Arrow } from './arrow';

describe('Arrow', () => {
  it('should export Arrow component', () => {
    expect(typeof Arrow).toBe('function');
  });
});
