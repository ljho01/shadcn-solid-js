import { describe, it, expect } from 'vitest';
import * as form from './index';

describe('form', () => {
  it('should export all components', () => {
    expect(form.Form).toBeDefined();
    expect(form.FormField).toBeDefined();
    expect(form.FormItem).toBeDefined();
    expect(form.FormLabel).toBeDefined();
    expect(form.FormControl).toBeDefined();
    expect(form.FormDescription).toBeDefined();
    expect(form.FormMessage).toBeDefined();
    expect(form.useFormField).toBeDefined();
  });
});
