import { createSignal, createEffect, on, batch, untrack, type Accessor } from 'solid-js';

type ChangeHandler<T> = (value: T) => void;

interface CreateControllableSignalParams<T> {
  /** The controlled value (if provided, component is controlled) */
  prop?: () => T | undefined;
  /** The default value for uncontrolled mode */
  defaultProp: T;
  /** Callback when value changes */
  onChange?: ChangeHandler<T>;
  /** Component name for dev warnings */
  caller?: string;
}

/**
 * Creates a controllable signal that can work in both controlled and uncontrolled modes.
 * SolidJS equivalent of React's useControllableState.
 *
 * In controlled mode (prop is defined): value comes from prop, onChange is called on updates.
 * In uncontrolled mode (prop is undefined): internal signal manages the state.
 *
 * @example
 * ```tsx
 * function Checkbox(props: { checked?: boolean; defaultChecked?: boolean; onChange?: (v: boolean) => void }) {
 *   const [checked, setChecked] = createControllableSignal({
 *     prop: () => props.checked,
 *     defaultProp: props.defaultChecked ?? false,
 *     onChange: props.onChange,
 *   });
 *   return <button onClick={() => setChecked(c => !c)} aria-checked={checked()} />;
 * }
 * ```
 */
function createControllableSignal<T>(
  params: CreateControllableSignalParams<T>
): [Accessor<T>, (value: T | ((prev: T) => T)) => void] {
  const { prop, defaultProp, onChange, caller } = params;

  const [internalValue, setInternalValue] = createSignal<T>(defaultProp);

  // Track controlled/uncontrolled switching in dev mode
  if (process.env.NODE_ENV !== 'production' && caller) {
    let wasControlled = prop ? prop() !== undefined : false;
    createEffect(
      on(
        () => (prop ? prop() !== undefined : false),
        (isControlled) => {
          if (wasControlled !== isControlled) {
            const from = wasControlled ? 'controlled' : 'uncontrolled';
            const to = isControlled ? 'controlled' : 'uncontrolled';
            console.warn(
              `${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
            );
          }
          wasControlled = isControlled;
        }
      )
    );
  }

  const isControlled = () => prop !== undefined && prop() !== undefined;

  const value: Accessor<T> = () => {
    if (isControlled()) {
      return prop!() as T;
    }
    return internalValue();
  };

  const setValue = (next: T | ((prev: T) => T)) => {
    const currentValue = untrack(value);
    const nextValue = typeof next === 'function'
      ? (next as (prev: T) => T)(currentValue)
      : next;

    if (Object.is(currentValue, nextValue)) return;

    if (untrack(isControlled)) {
      // Controlled mode: just notify parent
      onChange?.(nextValue);
    } else {
      // Uncontrolled mode: update internal state and notify
      batch(() => {
        setInternalValue(() => nextValue);
        onChange?.(nextValue);
      });
    }
  };

  return [value, setValue];
}

export { createControllableSignal };
export type { CreateControllableSignalParams };
