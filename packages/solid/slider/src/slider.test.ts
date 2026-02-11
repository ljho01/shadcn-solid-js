import { describe, it, expect } from 'vitest';
import { Slider, SliderTrack, SliderRange, SliderThumb } from './slider';

describe('Slider', () => {
  it('should export all Slider components', () => {
    expect(Slider).toBeDefined();
    expect(SliderTrack).toBeDefined();
    expect(SliderRange).toBeDefined();
    expect(SliderThumb).toBeDefined();
  });
});
