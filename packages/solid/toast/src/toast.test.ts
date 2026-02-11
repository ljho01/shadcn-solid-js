import { describe, it, expect } from 'vitest';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  createToastScope,
} from './toast';

describe('Toast', () => {
  it('should export all Toast components', () => {
    expect(ToastProvider).toBeDefined();
    expect(ToastViewport).toBeDefined();
    expect(Toast).toBeDefined();
    expect(ToastTitle).toBeDefined();
    expect(ToastDescription).toBeDefined();
    expect(ToastAction).toBeDefined();
    expect(ToastClose).toBeDefined();
  });

  it('should export createToastScope', () => {
    expect(createToastScope).toBeDefined();
    expect(typeof createToastScope).toBe('function');
  });
});
