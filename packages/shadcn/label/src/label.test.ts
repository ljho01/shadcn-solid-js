import { describe, it, expect } from 'vitest';
import * as LabelModule from './label';

describe('Label', () => {
  it('should export all components', () => {
    expect(LabelModule.Label).toBeDefined();
  });
});
