import { describe, it, expect } from 'vitest';
import * as buttonGroup from './index';

describe('button-group', () => {
  it('should export all components', () => {
    expect(buttonGroup.ButtonGroup).toBeDefined();
  });
});
