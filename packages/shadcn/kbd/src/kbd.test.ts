import { describe, it, expect } from 'vitest';
import * as KbdModule from './kbd';

describe('Kbd', () => {
  it('should export all components', () => {
    expect(KbdModule.Kbd).toBeDefined();
  });
});
