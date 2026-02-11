import { describe, it, expect } from 'vitest';
import * as nativeSelect from './index';

describe('native-select', () => {
  it('should export all components', () => {
    expect(nativeSelect.NativeSelect).toBeDefined();
  });
});
