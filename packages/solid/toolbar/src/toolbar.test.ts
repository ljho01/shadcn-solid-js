import { describe, it, expect } from 'vitest';
import { Toolbar, ToolbarButton, ToolbarSeparator } from './toolbar';

describe('Toolbar', () => {
  it('should export Toolbar components', () => {
    expect(Toolbar).toBeDefined();
    expect(ToolbarButton).toBeDefined();
    expect(ToolbarSeparator).toBeDefined();
  });
});
