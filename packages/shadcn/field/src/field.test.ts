import { describe, it, expect } from 'vitest';
import * as field from './index';

describe('field', () => {
  it('should export all components', () => {
    expect(field.Field).toBeDefined();
    expect(field.FieldLabel).toBeDefined();
    expect(field.FieldControl).toBeDefined();
    expect(field.FieldDescription).toBeDefined();
    expect(field.FieldMessage).toBeDefined();
  });
});
