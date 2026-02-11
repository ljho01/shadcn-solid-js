import { splitProps } from 'solid-js';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { createControllableSignal } from '@radix-solid-js/use-controllable-state';
import { Primitive, type PrimitiveProps } from '@radix-solid-js/primitive-component';

/* -------------------------------------------------------------------------------------------------
 * Toggle
 * -----------------------------------------------------------------------------------------------*/

const NAME = 'Toggle';

interface ToggleProps extends PrimitiveProps<'button'> {
  /**
   * The controlled state of the toggle.
   */
  pressed?: boolean;
  /**
   * The state of the toggle when initially rendered. Use `defaultPressed`
   * if you do not need to control the state of the toggle.
   * @defaultValue false
   */
  defaultPressed?: boolean;
  /**
   * The callback that fires when the state of the toggle changes.
   */
  onPressedChange?(pressed: boolean): void;
}

function Toggle(props: ToggleProps) {
  const [local, rest] = splitProps(props, [
    'pressed',
    'defaultPressed',
    'onPressedChange',
    'disabled',
    'onClick',
  ]);

  const [pressed, setPressed] = createControllableSignal({
    prop: () => local.pressed,
    defaultProp: local.defaultPressed ?? false,
    onChange: local.onPressedChange,
    caller: NAME,
  });

  return (
    <Primitive.button
      type="button"
      aria-pressed={pressed()}
      data-state={pressed() ? 'on' : 'off'}
      data-disabled={local.disabled ? '' : undefined}
      disabled={local.disabled}
      {...rest}
      onClick={composeEventHandlers<MouseEvent>(
        local.onClick as any,
        () => {
          if (!local.disabled) {
            setPressed((prev) => !prev);
          }
        }
      )}
    />
  );
}

/* ---------------------------------------------------------------------------------------------- */

const Root = Toggle;

export { Toggle, Root };
export type { ToggleProps };
