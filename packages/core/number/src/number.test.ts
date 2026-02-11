import { describe, it, expect } from 'vitest';
import { clamp } from './number';

describe('clamp', () => {
  it('should return value when within range', () => {
    expect(clamp(5, [0, 10])).toBe(5);
  });

  it('should clamp to min when value is below range', () => {
    expect(clamp(-5, [0, 10])).toBe(0);
  });

  it('should clamp to max when value is above range', () => {
    expect(clamp(15, [0, 10])).toBe(10);
  });

  it('should return min when min equals max', () => {
    expect(clamp(5, [3, 3])).toBe(3);
  });

  it('should handle negative ranges', () => {
    expect(clamp(0, [-10, -5])).toBe(-5);
    expect(clamp(-15, [-10, -5])).toBe(-10);
    expect(clamp(-7, [-10, -5])).toBe(-7);
  });

  it('should handle boundary values', () => {
    expect(clamp(0, [0, 10])).toBe(0);
    expect(clamp(10, [0, 10])).toBe(10);
  });
});
