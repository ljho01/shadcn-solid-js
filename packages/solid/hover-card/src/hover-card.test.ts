import { describe, it, expect } from 'vitest';
import { HoverCard, HoverCardTrigger, HoverCardPortal, HoverCardContent, HoverCardArrow, createHoverCardScope } from './hover-card';

describe('HoverCard', () => {
  it('should export all HoverCard components', () => {
    expect(HoverCard).toBeDefined();
    expect(HoverCardTrigger).toBeDefined();
    expect(HoverCardPortal).toBeDefined();
    expect(HoverCardContent).toBeDefined();
    expect(HoverCardArrow).toBeDefined();
  });

  it('should export createHoverCardScope', () => {
    expect(createHoverCardScope).toBeDefined();
    expect(typeof createHoverCardScope).toBe('function');
  });
});
