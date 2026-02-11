import { describe, it, expect, vi } from 'vitest';
import { createControllableSignal } from './use-controllable-state';
import { createSignal, createRoot } from 'solid-js';

describe('createControllableSignal', () => {
  it('should export createControllableSignal function', () => {
    expect(typeof createControllableSignal).toBe('function');
  });

  describe('uncontrolled mode', () => {
    it('should use defaultProp as initial value', () => {
      createRoot((dispose) => {
        const [value] = createControllableSignal({
          defaultProp: 'hello',
        });
        expect(value()).toBe('hello');
        dispose();
      });
    });

    it('should update value when setValue is called', () => {
      createRoot((dispose) => {
        const [value, setValue] = createControllableSignal({
          defaultProp: 0,
        });
        expect(value()).toBe(0);
        setValue(5);
        expect(value()).toBe(5);
        dispose();
      });
    });

    it('should support function updater', () => {
      createRoot((dispose) => {
        const [value, setValue] = createControllableSignal({
          defaultProp: 0,
        });
        setValue((prev) => prev + 1);
        expect(value()).toBe(1);
        setValue((prev) => prev + 1);
        expect(value()).toBe(2);
        dispose();
      });
    });

    it('should call onChange when value changes', () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const [, setValue] = createControllableSignal({
          defaultProp: 0,
          onChange,
        });
        setValue(5);
        expect(onChange).toHaveBeenCalledWith(5);
        dispose();
      });
    });

    it('should not call onChange when value is the same', () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const [, setValue] = createControllableSignal({
          defaultProp: 0,
          onChange,
        });
        setValue(0);
        expect(onChange).not.toHaveBeenCalled();
        dispose();
      });
    });
  });

  describe('controlled mode', () => {
    it('should use prop value', () => {
      createRoot((dispose) => {
        const [controlledValue] = createSignal(10);
        const [value] = createControllableSignal({
          prop: controlledValue,
          defaultProp: 0,
        });
        expect(value()).toBe(10);
        dispose();
      });
    });

    it('should call onChange but not update internal state', () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const [controlledValue] = createSignal(10);
        const [value, setValue] = createControllableSignal({
          prop: controlledValue,
          defaultProp: 0,
          onChange,
        });
        setValue(20);
        expect(onChange).toHaveBeenCalledWith(20);
        // Value stays controlled
        expect(value()).toBe(10);
        dispose();
      });
    });
  });
});
