import { type JSX, createSignal, createEffect, on, splitProps } from 'solid-js';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { mergeRefs } from '@radix-solid-js/compose-refs';
import { createContextScope } from '@radix-solid-js/context';
import { Presence } from '@radix-solid-js/presence';
import { Primitive, type PrimitiveProps } from '@radix-solid-js/primitive-component';
import { createPrevious } from '@radix-solid-js/use-previous';
import { createSize } from '@radix-solid-js/use-size';

import type { Scope } from '@radix-solid-js/context';

/* -------------------------------------------------------------------------------------------------
 * Radio
 * -----------------------------------------------------------------------------------------------*/

const RADIO_NAME = 'Radio';

const [createRadioContext, createRadioScope] = createContextScope(RADIO_NAME);

type RadioContextValue = { checked: boolean; disabled?: boolean };
const [RadioProvider, useRadioContext] =
  createRadioContext<RadioContextValue>(RADIO_NAME);

interface RadioProps extends PrimitiveProps<'button'> {
  checked?: boolean;
  required?: boolean;
  onCheck?(): void;
  name?: string;
  value?: string;
  form?: string;
  __scopeRadio?: Scope;
}

function Radio(props: RadioProps) {
  const [local, rest] = splitProps(props, [
    '__scopeRadio',
    'name',
    'checked',
    'required',
    'disabled',
    'value',
    'onCheck',
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

  const checked = () => local.checked ?? false;
  const value = () => local.value ?? 'on';

  return (
    <RadioProvider scope={local.__scopeRadio} checked={checked()} disabled={local.disabled}>
      <Primitive.button
        type="button"
        role="radio"
        aria-checked={checked()}
        data-state={getState(checked())}
        data-disabled={local.disabled ? '' : undefined}
        disabled={local.disabled}
        value={value()}
        {...rest}
        ref={mergeRefs(local.ref, (el: any) => setButton(el as HTMLButtonElement))}
        onClick={composeEventHandlers<MouseEvent>(
          local.onClick as any,
          (event) => {
            // radios cannot be unchecked so we only communicate a checked state
            if (!checked()) local.onCheck?.();
            if (isFormControl()) {
              hasConsumerStoppedPropagation = false;
              // if radio is in a form, stop propagation from the button so that we only propagate
              // one click event (from the input). We propagate changes from an input so that native
              // form validation works and form events reflect radio updates.
              if (!hasConsumerStoppedPropagation) event.stopPropagation();
            }
          }
        )}
      />
      {isFormControl() && (
        <RadioBubbleInput
          control={button()}
          bubbles={!hasConsumerStoppedPropagation}
          name={local.name}
          value={value()}
          checked={checked()}
          required={local.required}
          disabled={local.disabled}
          form={local.form}
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          style={{ transform: 'translateX(-100%)' }}
        />
      )}
    </RadioProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * RadioIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = 'RadioIndicator';

interface RadioIndicatorProps extends PrimitiveProps<'span'> {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true;
  __scopeRadio?: Scope;
}

function RadioIndicator(props: RadioIndicatorProps) {
  const [local, rest] = splitProps(props, ['__scopeRadio', 'forceMount', 'style']);
  const context = useRadioContext(INDICATOR_NAME, local.__scopeRadio);

  return (
    <Presence present={local.forceMount || context.checked}>
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
 * RadioBubbleInput
 * -----------------------------------------------------------------------------------------------*/

interface RadioBubbleInputProps {
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

function RadioBubbleInput(props: RadioBubbleInputProps) {
  let inputRef: HTMLInputElement | undefined;
  const prevChecked = createPrevious(() => props.checked);
  const controlSize = createSize(() => props.control);

  // Bubble checked change to parents (e.g form change event)
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
      type="radio"
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

/* ---------------------------------------------------------------------------------------------- */

function getState(checked: boolean) {
  return checked ? 'checked' : 'unchecked';
}

export {
  createRadioScope,
  //
  Radio,
  RadioIndicator,
};
export type { RadioProps, RadioIndicatorProps };
