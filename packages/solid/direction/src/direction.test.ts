import { describe, it, expect } from 'vitest';
import { useDirection } from './direction';

describe('useDirection', () => {
  it('should return ltr by default', () => {
    const dir = useDirection();
    expect(dir).toBe('ltr');
  });

  it('should return localDir when provided', () => {
    const dir = useDirection('rtl');
    expect(dir).toBe('rtl');
  });

  it('should prefer localDir over globalDir', () => {
    const dir = useDirection('rtl');
    expect(dir).toBe('rtl');
  });
});
