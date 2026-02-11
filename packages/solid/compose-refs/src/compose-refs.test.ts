import { describe, it, expect, vi } from 'vitest';
import { mergeRefs } from './compose-refs';

describe('mergeRefs', () => {
  it('should call all ref callbacks with the element', () => {
    const ref1 = vi.fn();
    const ref2 = vi.fn();
    const merged = mergeRefs(ref1, ref2);
    const element = document.createElement('div');

    merged(element);

    expect(ref1).toHaveBeenCalledWith(element);
    expect(ref2).toHaveBeenCalledWith(element);
  });

  it('should handle undefined refs gracefully', () => {
    const ref1 = vi.fn();
    const merged = mergeRefs(undefined, ref1, undefined);
    const element = document.createElement('div');

    expect(() => merged(element)).not.toThrow();
    expect(ref1).toHaveBeenCalledWith(element);
  });

  it('should handle empty refs array', () => {
    const merged = mergeRefs<HTMLDivElement>();
    const element = document.createElement('div');
    expect(() => merged(element)).not.toThrow();
  });

  it('should call refs in order', () => {
    const calls: number[] = [];
    const ref1 = () => calls.push(1);
    const ref2 = () => calls.push(2);
    const ref3 = () => calls.push(3);
    const merged = mergeRefs(ref1, ref2, ref3);

    merged(document.createElement('div'));
    expect(calls).toEqual([1, 2, 3]);
  });
});
