import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';

describe('Collapsible', () => {
  it('should export Collapsible components', () => {
    expect(Collapsible).toBeDefined();
    expect(CollapsibleTrigger).toBeDefined();
    expect(CollapsibleContent).toBeDefined();
  });

  it('should render Collapsible without errors', () => {
    createRoot((dispose) => {
      const el = Collapsible({});
      expect(el).toBeDefined();
      dispose();
    });
  });
});
