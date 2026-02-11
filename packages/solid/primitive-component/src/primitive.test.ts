import { describe, it, expect } from 'vitest';
import { Primitive, dispatchDiscreteCustomEvent } from './primitive';

describe('Primitive', () => {
  it('should have all expected element types', () => {
    expect(typeof Primitive.div).toBe('function');
    expect(typeof Primitive.button).toBe('function');
    expect(typeof Primitive.span).toBe('function');
    expect(typeof Primitive.a).toBe('function');
    expect(typeof Primitive.input).toBe('function');
    expect(typeof Primitive.form).toBe('function');
    expect(typeof Primitive.label).toBe('function');
    expect(typeof Primitive.select).toBe('function');
    expect(typeof Primitive.svg).toBe('function');
    expect(typeof Primitive.ul).toBe('function');
    expect(typeof Primitive.ol).toBe('function');
    expect(typeof Primitive.li).toBe('function');
    expect(typeof Primitive.nav).toBe('function');
    expect(typeof Primitive.h2).toBe('function');
    expect(typeof Primitive.h3).toBe('function');
    expect(typeof Primitive.p).toBe('function');
    expect(typeof Primitive.img).toBe('function');
  });
});

describe('dispatchDiscreteCustomEvent', () => {
  it('should dispatch event on target', () => {
    const target = document.createElement('div');
    let received = false;
    target.addEventListener('test', () => { received = true; });
    
    dispatchDiscreteCustomEvent(target, new CustomEvent('test'));
    expect(received).toBe(true);
  });

  it('should handle null target gracefully', () => {
    expect(() => {
      dispatchDiscreteCustomEvent(null, new CustomEvent('test'));
    }).not.toThrow();
  });
});
