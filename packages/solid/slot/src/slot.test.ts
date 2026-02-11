import { describe, it, expect } from 'vitest';
import { Slot, Slottable } from './slot';

describe('Slot', () => {
  it('should export Slot function', () => {
    expect(typeof Slot).toBe('function');
  });

  it('should export Slottable function', () => {
    expect(typeof Slottable).toBe('function');
  });

  it('should have __radixId on Slottable', () => {
    expect(typeof (Slottable as any).__radixId).toBe('symbol');
  });
});
