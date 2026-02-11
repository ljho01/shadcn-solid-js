import { describe, it, expect } from 'vitest';
import { AccessibleIcon } from './accessible-icon';

describe('AccessibleIcon', () => {
  it('should export AccessibleIcon component', () => {
    expect(AccessibleIcon).toBeDefined();
    expect(typeof AccessibleIcon).toBe('function');
  });
});
