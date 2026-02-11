import { describe, it, expect } from 'vitest';
import * as empty from './index';

describe('empty', () => {
  it('should export all components', () => {
    expect(empty.Empty).toBeDefined();
    expect(empty.EmptyIcon).toBeDefined();
    expect(empty.EmptyTitle).toBeDefined();
    expect(empty.EmptyDescription).toBeDefined();
    expect(empty.EmptyAction).toBeDefined();
  });
});
