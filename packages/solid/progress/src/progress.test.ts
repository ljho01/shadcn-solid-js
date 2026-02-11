import { describe, it, expect, vi } from 'vitest';
import { createRoot } from 'solid-js';
import { Progress, ProgressIndicator } from './progress';

describe('Progress', () => {
  it('should export Progress and ProgressIndicator', () => {
    expect(Progress).toBeDefined();
    expect(ProgressIndicator).toBeDefined();
  });

  it('should render without errors', () => {
    createRoot((dispose) => {
      const el = Progress({});
      expect(el).toBeDefined();
      dispose();
    });
  });

  it('should log error for invalid max', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    createRoot((dispose) => {
      Progress({ max: -1 });
      expect(spy).toHaveBeenCalled();
      dispose();
    });
    spy.mockRestore();
  });

  it('should log error for invalid value', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    createRoot((dispose) => {
      Progress({ value: 200, max: 100 });
      expect(spy).toHaveBeenCalled();
      dispose();
    });
    spy.mockRestore();
  });
});
