import { describe, it, expect } from 'vitest';
import * as sonner from './index';

describe('sonner', () => {
  it('should export Toaster component', () => {
    expect(sonner.Toaster).toBeDefined();
  });

  it('should export toast function', () => {
    expect(sonner.toast).toBeDefined();
    expect(typeof sonner.toast).toBe('function');
  });

  it('should export toast helper methods', () => {
    expect(typeof sonner.toast.success).toBe('function');
    expect(typeof sonner.toast.error).toBe('function');
    expect(typeof sonner.toast.info).toBe('function');
    expect(typeof sonner.toast.warning).toBe('function');
    expect(typeof sonner.toast.loading).toBe('function');
    expect(typeof sonner.toast.promise).toBe('function');
    expect(typeof sonner.toast.dismiss).toBe('function');
    expect(typeof sonner.toast.custom).toBe('function');
  });
});
