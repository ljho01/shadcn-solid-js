import { describe, it, expect, vi, beforeEach } from 'vitest';
import { observeElementRect, type Measurable } from './observe-element-rect';

describe('observeElementRect', () => {
  let mockElement: Measurable;
  let mockRect: DOMRect;

  beforeEach(() => {
    mockRect = {
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      top: 0,
      right: 100,
      bottom: 50,
      left: 0,
      toJSON: () => ({}),
    };
    mockElement = {
      getBoundingClientRect: () => mockRect,
    };
  });

  it('should return an unobserve function', () => {
    const callback = vi.fn();
    const unobserve = observeElementRect(mockElement, callback);
    expect(typeof unobserve).toBe('function');
    unobserve();
  });

  it('should call callback immediately for additional observers', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const unobserve1 = observeElementRect(mockElement, callback1);
    const unobserve2 = observeElementRect(mockElement, callback2);

    // Second callback gets called immediately with current rect
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith(mockRect);

    unobserve1();
    unobserve2();
  });

  it('should clean up when unobserved', () => {
    const callback = vi.fn();
    const unobserve = observeElementRect(mockElement, callback);
    unobserve();
    // Should not throw when called again
    unobserve();
  });
});
