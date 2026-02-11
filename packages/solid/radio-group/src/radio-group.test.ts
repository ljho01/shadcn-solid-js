import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { RadioGroup, RadioGroupItem, RadioGroupIndicator } from './radio-group';

describe('RadioGroup', () => {
  it('should export RadioGroup components', () => {
    expect(RadioGroup).toBeDefined();
    expect(RadioGroupItem).toBeDefined();
    expect(RadioGroupIndicator).toBeDefined();
  });

  it('should render RadioGroup without errors', () => {
    createRoot((dispose) => {
      const el = RadioGroup({});
      expect(el).toBeDefined();
      dispose();
    });
  });
});
