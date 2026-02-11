import { describe, it, expect } from 'vitest';
import { PasswordToggleField, PasswordToggleFieldInput, PasswordToggleFieldToggle, PasswordToggleFieldSlot, PasswordToggleFieldIcon, createPasswordToggleFieldScope } from './password-toggle-field';

describe('PasswordToggleField', () => {
  it('should export all components', () => {
    expect(PasswordToggleField).toBeDefined();
    expect(PasswordToggleFieldInput).toBeDefined();
    expect(PasswordToggleFieldToggle).toBeDefined();
    expect(PasswordToggleFieldSlot).toBeDefined();
    expect(PasswordToggleFieldIcon).toBeDefined();
  });

  it('should export createPasswordToggleFieldScope', () => {
    expect(createPasswordToggleFieldScope).toBeDefined();
    expect(typeof createPasswordToggleFieldScope).toBe('function');
  });
});
