import { describe, it, expect } from 'vitest';
import { RovingFocusGroup, RovingFocusGroupItem, createRovingFocusGroupScope } from './roving-focus-group';

describe('RovingFocusGroup', () => {
  it('should export RovingFocusGroup', () => {
    expect(typeof RovingFocusGroup).toBe('function');
  });
  it('should export RovingFocusGroupItem', () => {
    expect(typeof RovingFocusGroupItem).toBe('function');
  });
  it('should export createRovingFocusGroupScope', () => {
    expect(typeof createRovingFocusGroupScope).toBe('function');
  });
});
