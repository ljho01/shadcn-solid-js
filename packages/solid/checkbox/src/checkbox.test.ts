import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { Checkbox, CheckboxIndicator } from './checkbox';

describe('Checkbox', () => {
  it('should export Checkbox and CheckboxIndicator', () => {
    expect(Checkbox).toBeDefined();
    expect(CheckboxIndicator).toBeDefined();
  });

  it('should render Checkbox without errors', () => {
    createRoot((dispose) => {
      const el = Checkbox({});
      expect(el).toBeDefined();
      dispose();
    });
  });
});
