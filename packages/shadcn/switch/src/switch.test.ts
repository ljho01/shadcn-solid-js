import { describe, it, expect } from 'vitest';
import * as switchPkg from './index';

describe('switch', () => {
  it('should export all components', () => {
    expect(switchPkg.Switch).toBeDefined();
  });
});
