import { describe, it, expect } from 'vitest';
import * as inputGroup from './index';

describe('input-group', () => {
  it('should export all components', () => {
    expect(inputGroup.InputGroup).toBeDefined();
    expect(inputGroup.InputGroupAddon).toBeDefined();
    expect(inputGroup.InputGroupInput).toBeDefined();
  });
});
