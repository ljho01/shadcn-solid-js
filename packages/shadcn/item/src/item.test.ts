import { describe, it, expect } from 'vitest';
import * as item from './index';

describe('item', () => {
  it('should export all components', () => {
    expect(item.Item).toBeDefined();
    expect(item.ItemIcon).toBeDefined();
    expect(item.ItemContent).toBeDefined();
    expect(item.ItemTitle).toBeDefined();
    expect(item.ItemDescription).toBeDefined();
    expect(item.ItemAction).toBeDefined();
  });
});
