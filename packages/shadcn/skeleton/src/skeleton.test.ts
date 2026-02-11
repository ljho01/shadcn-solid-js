import { describe, it, expect } from 'vitest';
import * as SkeletonModule from './skeleton';

describe('Skeleton', () => {
  it('should export all components', () => {
    expect(SkeletonModule.Skeleton).toBeDefined();
  });
});
