import { type JSX, createSignal, createEffect, on, splitProps } from 'solid-js';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { mergeRefs } from '@radix-solid-js/compose-refs';
import { createContextScope } from '@radix-solid-js/context';
import { createControllableSignal } from '@radix-solid-js/use-controllable-state';
import { createPrevious } from '@radix-solid-js/use-previous';
import { createSize } from '@radix-solid-js/use-size';
import { Presence } from '@radix-solid-js/presence';
import { Primitive, type PrimitiveProps } from '@radix-solid-js/primitive-component';

import type { Scope } from '@radix-solid-js/context';

/* -------------------------------------------------------------------------------------------------
 * Checkbox
 * -----------------------------------------------------------------------------------------------*/

const CHECKBOX_NAME = 'Checkbox';

const [createCheckboxContext, createCheckboxScope] = createContextScope(CHECKBOX_NAME);

type CheckedState = boolean | 'indeterminate';

type CheckboxContextValue = {
  checked: CheckedState;
  disabled?: boolean;
};

const [CheckboxProvider, useCheckboxContext] =
  createCheckboxContext<CheckboxContextValue>(CHECKBOX_NAME);

interface CheckboxProps extends Omit<PrimitiveProps<'button'>, 'checked' | 'defaultChecked'> {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  required?: boolean;
  onCheckedChange?(checked: CheckedState): void;
  name?: string;
  value?: string;
  form?: string;
  __scopeCheckbox?: Scope;
}

function Checkbox(props: CheckboxProps) {
  const [local, rest] = splitProps(props, [
    '__scopeCheckbox',
    'name',
    'checked',
    'defaultChecked',
    'required',
    'disabled',
    'value',
    'onCheckedChange',
    'form',
    'onClick',
    'onKeyDown',
    'ref',
  ]);

  const [button, setButton] = createSignal<HTMLButtonElement | null>(null);
  let hasConsumerStoppedPropagation = false;

  const isFormControl = () => {
    const el = button();
    return el ? (local.form || !!el.closest('form')) : true;
  };

  const [checked, setChecked] = createControllableSignal<CheckedState>({
    prop: () => local.checked,
    defaultProp: local.defaultChecked ?? false,
    onChange: local.onCheckedChange,
    caller: CHECKBOX_NAME,
  });

  const value = () => local.value ?? 'on';

  // Form reset handler
  createEffect(() => {
    const control = button();
    if (control) {
      const form = control.form;
      if (form) {
        const initialChecked = checked();
        const reset = () => setChecked(initialChecked);
        form.addEventListener('reset', reset);
        return () => form.removeEventListener('reset', reset);
      }
    }
  });

  return (
    <CheckboxProvider scope={local.__scopeCheckbox} checked={checked()} disabled={local.disabled}>
      <Primitive.button
        type="button"
        role="checkbox"
        aria-checked={isIndeterminate(checked()) ? 'mixed' : checked() as boolean}
        aria-required={local.required}
        data-state={getState(checked())}
        data-disabled={local.disabled ? '' : undefined}
        disabled={local.disabled}
        value={value()}
        {...rest}
        ref={mergeRefs(local.ref, (el: any) => setButton(el as HTMLButtonElement))}
        onKeyDown={composeEventHandlers<KeyboardEvent>(
          local.onKeyDown as any,
          (event) => {
            // According to WAI ARIA, Checkboxes don't activate on enter keypress
            if (event.key === 'Enter') event.preventDefault();
          }
        )}
        onClick={composeEventHandlers<MouseEvent>(
          local.onClick as any,
          (event) => {
            setChecked((prevChecked) =>
              isIndeterminate(prevChecked) ? true : !prevChecked
            );
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
        <CheckboxBubbleInput
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
    </CheckboxProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * CheckboxIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = 'CheckboxIndicator';

interface CheckboxIndicatorProps extends PrimitiveProps<'span'> {
  forceMount?: true;
  __scopeCheckbox?: Scope;
}

function CheckboxIndicator(props: CheckboxIndicatorProps) {
  const [local, rest] = splitProps(props, ['__scopeCheckbox', 'forceMount', 'style']);
  const context = useCheckboxContext(INDICATOR_NAME, local.__scopeCheckbox);

  return (
    <Presence
      present={local.forceMount || isIndeterminate(context.checked) || context.checked === true}
    >
      <Primitive.span
        data-state={getState(context.checked)}
        data-disabled={context.disabled ? '' : undefined}
        {...rest}
        style={{
          'pointer-events': 'none',
          ...(typeof local.style === 'object' ? local.style : {}),
        }}
      />
    </Presence>
  );
}

/* -------------------------------------------------------------------------------------------------
 * CheckboxBubbleInput
 * -----------------------------------------------------------------------------------------------*/

interface CheckboxBubbleInputProps {
  checked: CheckedState;
  control: HTMLElement | null;
  bubbles: boolean;
  name?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  form?: string;
  style?: JSX.CSSProperties;
}

function CheckboxBubbleInput(props: CheckboxBubbleInputProps) {
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
          input.indeterminate = isIndeterminate(checked);
          setChecked.call(input, isIndeterminate(checked) ? false : (checked as boolean));
          input.dispatchEvent(event);
        }
      }
    )
  );

  return (
    <input
      type="checkbox"
      aria-hidden
      checked={isIndeterminate(props.checked) ? false : (props.checked as boolean)}
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

/* ---------------------------------------------------------------------------------------------- */

function isIndeterminate(checked?: CheckedState): checked is 'indeterminate' {
  return checked === 'indeterminate';
}

function getState(checked: CheckedState) {
  return isIndeterminate(checked) ? 'indeterminate' : checked ? 'checked' : 'unchecked';
}

const Root = Checkbox;
const Indicator = CheckboxIndicator;

export {
  createCheckboxScope,
  Checkbox,
  CheckboxIndicator,
  Root,
  Indicator,
};
export type { CheckboxProps, CheckboxIndicatorProps, CheckedState };
