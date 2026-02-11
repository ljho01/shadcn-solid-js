import { describe, it, expect } from 'vitest';
import * as hoverCard from './index';

describe('hover-card', () => {
  it('should export all components', () => {
    expect(hoverCard.HoverCard).toBeDefined();
    expect(hoverCard.HoverCardTrigger).toBeDefined();
    expect(hoverCard.HoverCardContent).toBeDefined();
  });
});
