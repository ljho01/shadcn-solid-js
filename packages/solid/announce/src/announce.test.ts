import { describe, it, expect } from 'vitest';
import { Announce } from './announce';

describe('Announce', () => {
  it('should export Announce component', () => {
    expect(typeof Announce).toBe('function');
  });
});
