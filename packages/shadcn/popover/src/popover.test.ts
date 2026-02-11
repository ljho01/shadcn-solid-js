import { describe, it, expect } from 'vitest';
import * as popover from './index';

describe('popover', () => {
  it('should export all components', () => {
    expect(popover.Popover).toBeDefined();
    expect(popover.PopoverTrigger).toBeDefined();
    expect(popover.PopoverContent).toBeDefined();
    expect(popover.PopoverAnchor).toBeDefined();
  });
});
