import { describe, it, expect } from 'vitest';
import { Form, FormField, FormLabel, FormControl, FormMessage, FormValidityState, FormSubmit, createFormScope } from './form';

describe('Form', () => {
  it('should export all Form components', () => {
    expect(Form).toBeDefined();
    expect(FormField).toBeDefined();
    expect(FormLabel).toBeDefined();
    expect(FormControl).toBeDefined();
    expect(FormMessage).toBeDefined();
    expect(FormValidityState).toBeDefined();
    expect(FormSubmit).toBeDefined();
  });

  it('should export createFormScope', () => {
    expect(createFormScope).toBeDefined();
    expect(typeof createFormScope).toBe('function');
  });
});
