import { describe, it, expect } from 'vitest';
import * as tooltip from './index';

describe('tooltip', () => {
  it('should export all components', () => {
    expect(tooltip.TooltipProvider).toBeDefined();
    expect(tooltip.Tooltip).toBeDefined();
    expect(tooltip.TooltipTrigger).toBeDefined();
    expect(tooltip.TooltipContent).toBeDefined();
  });
});
