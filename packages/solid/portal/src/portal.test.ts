import { describe, it, expect } from 'vitest';
import { Portal } from './portal';

describe('Portal', () => {
  it('should export Portal component', () => {
    expect(typeof Portal).toBe('function');
  });
});
