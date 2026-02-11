import { describe, it, expect } from 'vitest';
import * as SpinnerModule from './spinner';

describe('Spinner', () => {
  it('should export all components', () => {
    expect(SpinnerModule.Spinner).toBeDefined();
  });
});
