import { describe, it, expect } from 'vitest';
import { FocusScope } from './focus-scope';

describe('FocusScope', () => {
  it('should export FocusScope component', () => {
    expect(typeof FocusScope).toBe('function');
  });
});
