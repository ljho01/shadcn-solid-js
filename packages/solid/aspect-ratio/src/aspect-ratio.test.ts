import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { AspectRatio } from './aspect-ratio';

describe('AspectRatio', () => {
  it('should export AspectRatio component', () => {
    expect(AspectRatio).toBeDefined();
    expect(typeof AspectRatio).toBe('function');
  });

  it('should render without errors', () => {
    createRoot((dispose) => {
      const el = AspectRatio({});
      expect(el).toBeDefined();
      dispose();
    });
  });

  it('should accept a ratio prop', () => {
    createRoot((dispose) => {
      const el = AspectRatio({ ratio: 16 / 9 });
      expect(el).toBeDefined();
      dispose();
    });
  });
});
