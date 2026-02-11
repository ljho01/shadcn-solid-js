import { describe, it, expect } from 'vitest';
import * as aspectRatio from './index';

describe('aspect-ratio', () => {
  it('should export all components', () => {
    expect(aspectRatio.AspectRatio).toBeDefined();
  });
});
