import { describe, it, expect } from 'vitest';
import * as InputModule from './input';

describe('Input', () => {
  it('should export all components', () => {
    expect(InputModule.Input).toBeDefined();
  });
});
