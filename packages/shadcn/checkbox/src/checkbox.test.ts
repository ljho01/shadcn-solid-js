import { describe, it, expect } from 'vitest';
import * as checkbox from './index';

describe('checkbox', () => {
  it('should export all components', () => {
    expect(checkbox.Checkbox).toBeDefined();
  });
});
