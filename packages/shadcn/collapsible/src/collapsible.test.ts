import { describe, it, expect } from 'vitest';
import * as collapsible from './index';

describe('collapsible', () => {
  it('should export all components', () => {
    expect(collapsible.Collapsible).toBeDefined();
    expect(collapsible.CollapsibleTrigger).toBeDefined();
    expect(collapsible.CollapsibleContent).toBeDefined();
  });
});
