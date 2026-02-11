import { type JSX, createSignal, createEffect, on, splitProps } from 'solid-js';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { mergeRefs } from '@radix-solid-js/compose-refs';
import { createContextScope } from '@radix-solid-js/context';
import { createControllableSignal } from '@radix-solid-js/use-controllable-state';
import { createPrevious } from '@radix-solid-js/use-previous';
import { createSize } from '@radix-solid-js/use-size';
import { Primitive, type PrimitiveProps } from '@radix-solid-js/primitive-component';

import type { Scope } from '@radix-solid-js/context';

/* -------------------------------------------------------------------------------------------------
 * Switch
 * -----------------------------------------------------------------------------------------------*/

const SWITCH_NAME = 'Switch';

const [createSwitchContext, createSwitchScope] = createContextScope(SWITCH_NAME);

type SwitchContextValue = { checked: boolean; disabled?: boolean };
const [SwitchProvider, useSwitchContext] =
  createSwitchContext<SwitchContextValue>(SWITCH_NAME);

interface SwitchProps extends PrimitiveProps<'button'> {
  checked?: boolean;
  defaultChecked?: boolean;
  required?: boolean;
  onCheckedChange?(checked: boolean): void;
  name?: string;
  value?: string;
  form?: string;
  __scopeSwitch?: Scope;
}

function Switch(props: SwitchProps) {
  const [local, rest] = splitProps(props, [
    '__scopeSwitch',
    'name',
    'checked',
    'defaultChecked',
    'required',
    'disabled',
    'value',
    'onCheckedChange',
    'form',
    'onClick',
    'ref',
  ]);

  const [button, setButton] = createSignal<HTMLButtonElement | null>(null);
  let hasConsumerStoppedPropagation = false;

  const isFormControl = () => {
    const el = button();
    return el ? (local.form || !!el.closest('form')) : true;
  };

  const [checked, setChecked] = createControllableSignal({
    prop: () => local.checked,
    defaultProp: local.defaultChecked ?? false,
    onChange: local.onCheckedChange,
    caller: SWITCH_NAME,
  });

  const value = () => local.value ?? 'on';

  return (
    <SwitchProvider scope={local.__scopeSwitch} checked={checked()} disabled={local.disabled}>
      <Primitive.button
        type="button"
        role="switch"
        aria-checked={checked()}
        aria-required={local.required}
        data-state={getState(checked())}
        data-disabled={local.disabled ? '' : undefined}
        disabled={local.disabled}
        value={value()}
        {...rest}
        ref={mergeRefs(local.ref, (el: any) => setButton(el as HTMLButtonElement))}
        onClick={composeEventHandlers<MouseEvent>(
          local.onClick as any,
          (event) => {
            setChecked((prev) => !prev);
            if (isFormControl()) {
              // isPropagationStopped is React-specific; not available on native DOM events.
              // Default to false (propagation not stopped by consumer).
              hasConsumerStoppedPropagation = false;
              event.stopPropagation();
            }
          }
        )}
      />
      {isFormControl() && (
        <SwitchBubbleInput
          control={button()}
          bubbles={!hasConsumerStoppedPropagation}
          name={local.name}
          value={value()}
          checked={checked()}
          required={local.required}
          disabled={local.disabled}
          form={local.form}
          style={{ transform: 'translateX(-100%)' }}
        />
      )}
    </SwitchProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * SwitchThumb
 * -----------------------------------------------------------------------------------------------*/

const THUMB_NAME = 'SwitchThumb';

interface SwitchThumbProps extends PrimitiveProps<'span'> {
  __scopeSwitch?: Scope;
}

function SwitchThumb(props: SwitchThumbProps) {
  const [local, rest] = splitProps(props, ['__scopeSwitch']);
  const context = useSwitchContext(THUMB_NAME, local.__scopeSwitch);
  return (
    <Primitive.span
      data-state={getState(context.checked)}
      data-disabled={context.disabled ? '' : undefined}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * SwitchBubbleInput
 * -----------------------------------------------------------------------------------------------*/

interface SwitchBubbleInputProps {
  checked: boolean;
  control: HTMLElement | null;
  bubbles: boolean;
  name?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  form?: string;
  style?: JSX.CSSProperties;
}

function SwitchBubbleInput(props: SwitchBubbleInputProps) {
  let inputRef: HTMLInputElement | undefined;
  const prevChecked = createPrevious(() => props.checked);
  const controlSize = createSize(() => props.control);

  createEffect(
    on(
      () => props.checked,
      (checked) => {
        const input = inputRef;
        if (!input) return;

        const inputProto = window.HTMLInputElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(
          inputProto,
          'checked'
        ) as PropertyDescriptor;
        const setChecked = descriptor.set;

        if (prevChecked() !== checked && setChecked) {
          const event = new Event('click', { bubbles: props.bubbles });
          setChecked.call(input, checked);
          input.dispatchEvent(event);
        }
      }
    )
  );

  return (
    <input
      type="checkbox"
      aria-hidden
      checked={props.checked}
      name={props.name}
      value={props.value}
      required={props.required}
      disabled={props.disabled}
      form={props.form}
      tabIndex={-1}
      ref={(el) => (inputRef = el)}
      style={{
        ...(props.style || {}),
        ...(controlSize() || {}),
        position: 'absolute',
        'pointer-events': 'none',
        opacity: '0',
        margin: '0',
      } as JSX.CSSProperties}
    />
  );
}

/* -----------------------------------------------------------------------------------------------*/

function getState(checked: boolean) {
  return checked ? 'checked' : 'unchecked';
}

const Root = Switch;
const Thumb = SwitchThumb;

export {
  createSwitchScope,
  Switch,
  SwitchThumb,
  Root,
  Thumb,
};
export type { SwitchProps, SwitchThumbProps };
