import { describe, it, expect } from 'vitest';
// import { createRoot } from 'solid-js';
import {
  OneTimePasswordField,
  OneTimePasswordFieldInput,
  OneTimePasswordFieldHiddenInput,
  Root,
  Input,
  HiddenInput,
} from './one-time-password-field';

describe('OneTimePasswordField', () => {
  it('should export all components', () => {
    expect(OneTimePasswordField).toBeDefined();
    expect(OneTimePasswordFieldInput).toBeDefined();
    expect(OneTimePasswordFieldHiddenInput).toBeDefined();
  });

  it('should export aliases', () => {
    expect(Root).toBe(OneTimePasswordField);
    expect(Input).toBe(OneTimePasswordFieldInput);
    expect(HiddenInput).toBe(OneTimePasswordFieldHiddenInput);
  });
});
