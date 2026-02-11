import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

describe('ToggleGroup', () => {
  it('should export ToggleGroup and ToggleGroupItem', () => {
    expect(ToggleGroup).toBeDefined();
    expect(ToggleGroupItem).toBeDefined();
  });

  it('should render single ToggleGroup without errors', () => {
    createRoot((dispose) => {
      const el = ToggleGroup({ type: 'single' });
      expect(el).toBeDefined();
      dispose();
    });
  });

  it('should render multiple ToggleGroup without errors', () => {
    createRoot((dispose) => {
      const el = ToggleGroup({ type: 'multiple' });
      expect(el).toBeDefined();
      dispose();
    });
  });
});
