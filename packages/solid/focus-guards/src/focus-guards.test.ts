import { describe, it, expect } from 'vitest';
import { useFocusGuards, FocusGuards } from './focus-guards';

describe('FocusGuards', () => {
  it('should export useFocusGuards function', () => {
    expect(typeof useFocusGuards).toBe('function');
  });

  it('should export FocusGuards component', () => {
    expect(typeof FocusGuards).toBe('function');
  });
});
