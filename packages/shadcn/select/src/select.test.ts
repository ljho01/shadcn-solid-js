import { describe, it, expect } from 'vitest';
import * as select from './index';

describe('select', () => {
  it('should export all components', () => {
    expect(select.Select).toBeDefined();
    expect(select.SelectTrigger).toBeDefined();
    expect(select.SelectValue).toBeDefined();
    expect(select.SelectContent).toBeDefined();
    expect(select.SelectGroup).toBeDefined();
    expect(select.SelectLabel).toBeDefined();
    expect(select.SelectItem).toBeDefined();
    expect(select.SelectSeparator).toBeDefined();
    expect(select.SelectScrollUpButton).toBeDefined();
    expect(select.SelectScrollDownButton).toBeDefined();
  });
});
