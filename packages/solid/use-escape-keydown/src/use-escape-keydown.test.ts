import { describe, it, expect } from 'vitest';
import { createEscapeKeydown } from './use-escape-keydown';

describe('createEscapeKeydown', () => {
  it('should export createEscapeKeydown function', () => {
    expect(typeof createEscapeKeydown).toBe('function');
  });
});
