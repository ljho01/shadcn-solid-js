import { createEffect, onCleanup, splitProps } from 'solid-js';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { mergeRefs } from '@radix-solid-js/compose-refs';
import { createContextScope } from '@radix-solid-js/context';
import { useDirection } from '@radix-solid-js/direction';
import { Primitive, type PrimitiveProps } from '@radix-solid-js/primitive-component';
import {
  RovingFocusGroup,
  RovingFocusGroupItem,
  createRovingFocusGroupScope,
} from '@radix-solid-js/roving-focus';
import { createControllableSignal } from '@radix-solid-js/use-controllable-state';
import { Radio, RadioIndicator, createRadioScope } from './radio';

import type { Scope } from '@radix-solid-js/context';
import type { RadioIndicatorProps } from './radio';

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

/* -------------------------------------------------------------------------------------------------
 * RadioGroup
 * -----------------------------------------------------------------------------------------------*/

const RADIO_GROUP_NAME = 'RadioGroup';

const [createRadioGroupContext, createRadioGroupScope] = createContextScope(RADIO_GROUP_NAME, [
  createRovingFocusGroupScope,
  createRadioScope,
]);
const useRovingFocusGroupScope = createRovingFocusGroupScope();
const useRadioScope = createRadioScope();

type RadioGroupContextValue = {
  name?: string;
  required: boolean;
  disabled: boolean;
  value: string | null;
  onValueChange(value: string): void;
};

const [RadioGroupProvider, useRadioGroupContext] =
  createRadioGroupContext<RadioGroupContextValue>(RADIO_GROUP_NAME);

interface RadioGroupProps extends PrimitiveProps<'div'> {
  name?: string;
  required?: boolean;
  disabled?: boolean;
  dir?: 'ltr' | 'rtl';
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
  defaultValue?: string;
  value?: string | null;
  onValueChange?(value: string): void;
  __scopeRadioGroup?: Scope;
}

function RadioGroup(props: RadioGroupProps) {
  const [local, rest] = splitProps(props, [
    '__scopeRadioGroup',
    'name',
    'defaultValue',
    'value',
    'required',
    'disabled',
    'orientation',
    'dir',
    'loop',
    'onValueChange',
    'ref',
  ]);

  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeRadioGroup);
  const direction = useDirection(local.dir);

  const [value, setValue] = createControllableSignal<string | null>({
    prop: () => local.value,
    defaultProp: local.defaultValue ?? null,
    onChange: local.onValueChange as (value: string | null) => void,
    caller: RADIO_GROUP_NAME,
  });

  const required = () => local.required ?? false;
  const disabled = () => local.disabled ?? false;
  const loop = () => local.loop ?? true;

  return (
    <RadioGroupProvider
      scope={local.__scopeRadioGroup}
      name={local.name}
      required={required()}
      disabled={disabled()}
      value={value()}
      onValueChange={setValue}
    >
      <RovingFocusGroup
        asChild
        {...rovingFocusGroupScope}
        orientation={local.orientation}
        dir={direction}
        loop={loop()}
      >
        <Primitive.div
          role="radiogroup"
          aria-required={required()}
          aria-orientation={local.orientation}
          data-disabled={disabled() ? '' : undefined}
          dir={direction}
          {...rest}
          ref={local.ref}
        />
      </RovingFocusGroup>
    </RadioGroupProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * RadioGroupItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'RadioGroupItem';

interface RadioGroupItemProps extends PrimitiveProps<'button'> {
  value: string;
  disabled?: boolean;
  __scopeRadioGroup?: Scope;
}

function RadioGroupItem(props: RadioGroupItemProps) {
  const [local, rest] = splitProps(props, [
    '__scopeRadioGroup',
    'disabled',
    'value',
    'ref',
    'onFocus',
    'onKeyDown',
  ]);

  const context = useRadioGroupContext(ITEM_NAME, local.__scopeRadioGroup);
  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeRadioGroup);
  const radioScope = useRadioScope(local.__scopeRadioGroup);

  const isDisabled = () => context.disabled || local.disabled;
  const checked = () => context.value === local.value;

  let ref: HTMLButtonElement | undefined;
  let isArrowKeyPressed = false;

  createEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (ARROW_KEYS.includes(event.key)) {
        isArrowKeyPressed = true;
      }
    };
    const handleKeyUp = () => {
      isArrowKeyPressed = false;
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    });
  });

  return (
    <RovingFocusGroupItem
      asChild
      {...rovingFocusGroupScope}
      focusable={!isDisabled()}
      active={checked()}
    >
      <Radio
        disabled={isDisabled()}
        required={context.required}
        checked={checked()}
        {...radioScope}
        {...rest}
        name={context.name}
        ref={mergeRefs(local.ref, (el: any) => { ref = el as HTMLButtonElement; })}
        onCheck={() => context.onValueChange(local.value)}
        onKeyDown={composeEventHandlers<KeyboardEvent>(
          local.onKeyDown as any,
          (event) => {
            // According to WAI ARIA, radio groups don't activate items on enter keypress
            if (event.key === 'Enter') event.preventDefault();
          }
        )}
        onFocus={composeEventHandlers<FocusEvent>(
          local.onFocus as any,
          () => {
            /**
             * Our `RovingFocusGroup` will focus the radio when navigating with arrow keys
             * and we need to "check" it in that case. We click it to "check" it (instead
             * of updating `context.value`) so that the radio change event fires.
             */
            if (isArrowKeyPressed) ref?.click();
          }
        )}
      />
    </RovingFocusGroupItem>
  );
}

/* -------------------------------------------------------------------------------------------------
 * RadioGroupIndicator
 * -----------------------------------------------------------------------------------------------*/

interface RadioGroupIndicatorProps extends RadioIndicatorProps {
  __scopeRadioGroup?: Scope;
}

function RadioGroupIndicator(props: RadioGroupIndicatorProps) {
  const [local, rest] = splitProps(props, ['__scopeRadioGroup']);
  const radioScope = useRadioScope(local.__scopeRadioGroup);
  return <RadioIndicator {...radioScope} {...rest} />;
}

/* ---------------------------------------------------------------------------------------------- */

const Root = RadioGroup;
const Item = RadioGroupItem;
const Indicator = RadioGroupIndicator;

export {
  createRadioGroupScope,
  //
  RadioGroup,
  RadioGroupItem,
  RadioGroupIndicator,
  //
  Root,
  Item,
  Indicator,
};
export type { RadioGroupProps, RadioGroupItemProps, RadioGroupIndicatorProps };
