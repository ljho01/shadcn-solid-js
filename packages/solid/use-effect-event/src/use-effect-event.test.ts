import { describe, it, expect } from 'vitest';
import { createEffectEvent, useEffectEvent } from './use-effect-event';

describe('useEffectEvent', () => {
  it('should export createEffectEvent', () => {
    expect(createEffectEvent).toBeDefined();
    expect(typeof createEffectEvent).toBe('function');
  });

  it('should export useEffectEvent', () => {
    expect(useEffectEvent).toBeDefined();
    expect(typeof useEffectEvent).toBe('function');
  });

  it('createEffectEvent should return a callable function', () => {
    const fn = createEffectEvent((x: number) => x * 2);
    expect(fn(5)).toBe(10);
  });

  it('useEffectEvent should return the same function', () => {
    const original = (x: number) => x + 1;
    const result = useEffectEvent(original);
    expect(result).toBe(original);
    expect(result(3)).toBe(4);
  });
});
