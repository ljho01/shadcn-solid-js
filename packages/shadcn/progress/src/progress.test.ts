import { describe, it, expect } from 'vitest';
import * as progress from './index';

describe('progress', () => {
  it('should export all components', () => {
    expect(progress.Progress).toBeDefined();
  });
});
