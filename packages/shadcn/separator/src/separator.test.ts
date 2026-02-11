import { describe, it, expect } from 'vitest';
import * as SeparatorModule from './separator';

describe('Separator', () => {
  it('should export all components', () => {
    expect(SeparatorModule.Separator).toBeDefined();
  });
});
