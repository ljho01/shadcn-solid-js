import { describe, it, expect } from 'vitest';
import { VisuallyHidden, VISUALLY_HIDDEN_STYLES } from './visually-hidden';

describe('VisuallyHidden', () => {
  it('should export VisuallyHidden component', () => {
    expect(typeof VisuallyHidden).toBe('function');
  });

  it('should export VISUALLY_HIDDEN_STYLES', () => {
    expect(VISUALLY_HIDDEN_STYLES).toBeDefined();
    expect(VISUALLY_HIDDEN_STYLES.position).toBe('absolute');
    expect(VISUALLY_HIDDEN_STYLES.overflow).toBe('hidden');
  });
});
