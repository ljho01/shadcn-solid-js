import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { Label } from './label';

describe('Label', () => {
  it('should export Label component', () => {
    expect(Label).toBeDefined();
    expect(typeof Label).toBe('function');
  });

  it('should render without errors', () => {
    createRoot((dispose) => {
      const el = Label({});
      expect(el).toBeDefined();
      dispose();
    });
  });
});
