import { describe, it, expect } from 'vitest';
import * as carousel from './index';

describe('carousel', () => {
  it('should export all components', () => {
    expect(carousel.Carousel).toBeDefined();
    expect(carousel.CarouselContent).toBeDefined();
    expect(carousel.CarouselItem).toBeDefined();
    expect(carousel.CarouselPrevious).toBeDefined();
    expect(carousel.CarouselNext).toBeDefined();
    expect(carousel.useCarousel).toBeDefined();
  });
});
