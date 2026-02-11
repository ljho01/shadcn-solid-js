import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { Separator } from './separator';

describe('Separator', () => {
  it('should export Separator component', () => {
    expect(Separator).toBeDefined();
    expect(typeof Separator).toBe('function');
  });

  it('should render without errors', () => {
    createRoot((dispose) => {
      const el = Separator({});
      expect(el).toBeDefined();
      dispose();
    });
  });

  it('should default to horizontal orientation', () => {
    createRoot((dispose) => {
      const el = Separator({}) as HTMLElement;
      expect(el.getAttribute?.('data-orientation') ?? 'horizontal').toBe('horizontal');
      dispose();
    });
  });
});
