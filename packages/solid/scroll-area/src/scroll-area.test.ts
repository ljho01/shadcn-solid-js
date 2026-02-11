import { describe, it, expect } from 'vitest';
import { ScrollArea, ScrollAreaViewport, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaCorner } from './scroll-area';

describe('ScrollArea', () => {
  it('should export all ScrollArea components', () => {
    expect(ScrollArea).toBeDefined();
    expect(ScrollAreaViewport).toBeDefined();
    expect(ScrollAreaScrollbar).toBeDefined();
    expect(ScrollAreaThumb).toBeDefined();
    expect(ScrollAreaCorner).toBeDefined();
  });
});
