import { describe, it, expect } from 'vitest';
import * as scrollArea from './index';

describe('scroll-area', () => {
  it('should export all components', () => {
    expect(scrollArea.ScrollArea).toBeDefined();
    expect(scrollArea.ScrollBar).toBeDefined();
  });
});
