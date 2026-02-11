import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { Switch, SwitchThumb } from './switch';

describe('Switch', () => {
  it('should export Switch and SwitchThumb', () => {
    expect(Switch).toBeDefined();
    expect(SwitchThumb).toBeDefined();
  });

  it('should render Switch without errors', () => {
    createRoot((dispose) => {
      const el = Switch({});
      expect(el).toBeDefined();
      dispose();
    });
  });
});
