import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs', () => {
  it('should export all Tabs components', () => {
    expect(Tabs).toBeDefined();
    expect(TabsList).toBeDefined();
    expect(TabsTrigger).toBeDefined();
    expect(TabsContent).toBeDefined();
  });

  it('should render Tabs without errors', () => {
    createRoot((dispose) => {
      const el = Tabs({});
      expect(el).toBeDefined();
      dispose();
    });
  });
});
