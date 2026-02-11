import { describe, it, expect } from 'vitest';
import { Popper, PopperAnchor, PopperContent, PopperArrow, createPopperScope, SIDE_OPTIONS, ALIGN_OPTIONS } from './popper';

describe('Popper', () => {
  it('should export all Popper components', () => {
    expect(typeof Popper).toBe('function');
    expect(typeof PopperAnchor).toBe('function');
    expect(typeof PopperContent).toBe('function');
    expect(typeof PopperArrow).toBe('function');
  });
  it('should export createPopperScope', () => {
    expect(typeof createPopperScope).toBe('function');
  });
  it('should export side and align options', () => {
    expect(SIDE_OPTIONS).toEqual(['top', 'right', 'bottom', 'left']);
    expect(ALIGN_OPTIONS).toEqual(['start', 'center', 'end']);
  });
});
