import { describe, it, expect } from 'vitest';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, TooltipArrow } from './tooltip';

describe('Tooltip', () => {
  it('should export all Tooltip components', () => {
    expect(TooltipProvider).toBeDefined();
    expect(Tooltip).toBeDefined();
    expect(TooltipTrigger).toBeDefined();
    expect(TooltipContent).toBeDefined();
    expect(TooltipArrow).toBeDefined();
  });
});
