import { describe, it, expect } from 'vitest';
import * as toggleGroup from './index';

describe('toggle-group', () => {
  it('should export all components', () => {
    expect(toggleGroup.ToggleGroup).toBeDefined();
    expect(toggleGroup.ToggleGroupItem).toBeDefined();
  });
});
