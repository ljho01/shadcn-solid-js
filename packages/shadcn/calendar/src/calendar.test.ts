import { describe, it, expect } from 'vitest';
import * as calendar from './index';

describe('calendar', () => {
  it('should export all components', () => {
    expect(calendar.Calendar).toBeDefined();
  });
});
