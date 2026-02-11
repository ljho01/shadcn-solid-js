import { describe, it, expect } from 'vitest';
import * as TextareaModule from './textarea';

describe('Textarea', () => {
  it('should export all components', () => {
    expect(TextareaModule.Textarea).toBeDefined();
  });
});
