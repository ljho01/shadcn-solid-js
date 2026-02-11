import { describe, it, expect } from 'vitest';
import * as radioGroup from './index';

describe('radio-group', () => {
  it('should export all components', () => {
    expect(radioGroup.RadioGroup).toBeDefined();
    expect(radioGroup.RadioGroupItem).toBeDefined();
  });
});
