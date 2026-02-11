import { describe, it, expect } from 'vitest';
import * as combobox from './index';

describe('combobox', () => {
  it('should export all components', () => {
    expect(combobox.Combobox).toBeDefined();
  });
});
