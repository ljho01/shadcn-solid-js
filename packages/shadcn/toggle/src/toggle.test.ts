import { describe, it, expect } from 'vitest';
import * as toggle from './index';

describe('toggle', () => {
  it('should export all components', () => {
    expect(toggle.Toggle).toBeDefined();
    expect(toggle.toggleVariants).toBeDefined();
  });
});
