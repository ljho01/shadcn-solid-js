import { describe, it, expect } from 'vitest';
import { DismissableLayer, DismissableLayerBranch } from './dismissable-layer';

describe('DismissableLayer', () => {
  it('should export DismissableLayer', () => {
    expect(typeof DismissableLayer).toBe('function');
  });
  it('should export DismissableLayerBranch', () => {
    expect(typeof DismissableLayerBranch).toBe('function');
  });
});
