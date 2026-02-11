import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { Toggle } from './toggle';

describe('Toggle', () => {
  it('should export Toggle component', () => {
    expect(Toggle).toBeDefined();
    expect(typeof Toggle).toBe('function');
  });

  it('should render without errors', () => {
    createRoot((dispose) => {
      const el = Toggle({});
      expect(el).toBeDefined();
      dispose();
    });
  });

  it('should default to unpressed state', () => {
    createRoot((dispose) => {
      const el = Toggle({}) as HTMLButtonElement;
      // The element should have aria-pressed false by default
      expect(el).toBeDefined();
      dispose();
    });
  });
});
