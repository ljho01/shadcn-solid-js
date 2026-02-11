import { describe, it, expect } from 'vitest';
import * as tabs from './index';

describe('tabs', () => {
  it('should export all components', () => {
    expect(tabs.Tabs).toBeDefined();
    expect(tabs.TabsList).toBeDefined();
    expect(tabs.TabsTrigger).toBeDefined();
    expect(tabs.TabsContent).toBeDefined();
  });
});
