import { describe, it, expect } from 'vitest';
import * as slider from './index';

describe('slider', () => {
  it('should export all components', () => {
    expect(slider.Slider).toBeDefined();
  });
});
