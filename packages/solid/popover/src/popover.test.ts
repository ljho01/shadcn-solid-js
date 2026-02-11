import { describe, it, expect } from 'vitest';
import { Popover, PopoverTrigger, PopoverPortal, PopoverContent, PopoverClose, PopoverArrow, PopoverAnchor, createPopoverScope } from './popover';

describe('Popover', () => {
  it('should export all Popover components', () => {
    expect(Popover).toBeDefined();
    expect(PopoverTrigger).toBeDefined();
    expect(PopoverPortal).toBeDefined();
    expect(PopoverContent).toBeDefined();
    expect(PopoverClose).toBeDefined();
    expect(PopoverArrow).toBeDefined();
    expect(PopoverAnchor).toBeDefined();
  });

  it('should export createPopoverScope', () => {
    expect(createPopoverScope).toBeDefined();
    expect(typeof createPopoverScope).toBe('function');
  });
});
