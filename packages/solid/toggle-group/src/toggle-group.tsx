import { splitProps, Show } from 'solid-js';
import { createContextScope } from '@radix-solid-js/context';
import { Primitive, type PrimitiveProps } from '@radix-solid-js/primitive-component';
import {
  RovingFocusGroup,
  RovingFocusGroupItem,
  createRovingFocusGroupScope,
} from '@radix-solid-js/roving-focus';
import { Toggle, type ToggleProps } from '@radix-solid-js/toggle';
import { createControllableSignal } from '@radix-solid-js/use-controllable-state';
import { useDirection } from '@radix-solid-js/direction';

import type { Scope } from '@radix-solid-js/context';

/* -------------------------------------------------------------------------------------------------
 * ToggleGroup
 * -----------------------------------------------------------------------------------------------*/

const TOGGLE_GROUP_NAME = 'ToggleGroup';

type ScopedProps<P> = P & { __scopeToggleGroup?: Scope };
const [createToggleGroupContext, createToggleGroupScope] = createContextScope(
  TOGGLE_GROUP_NAME,
  [createRovingFocusGroupScope]
);
const useRovingFocusGroupScope = createRovingFocusGroupScope();

interface ToggleGroupSingleProps extends ToggleGroupImplSingleProps {
  type: 'single';
}

interface ToggleGroupMultipleProps extends ToggleGroupImplMultipleProps {
  type: 'multiple';
}

function ToggleGroup(props: ScopedProps<ToggleGroupSingleProps | ToggleGroupMultipleProps>) {
  const [local, rest] = splitProps(props, ['type']);

  if (local.type === 'single') {
    return <ToggleGroupImplSingle {...(rest as unknown as ScopedProps<ToggleGroupImplSingleProps>)} />;
  }

  if (local.type === 'multiple') {
    return <ToggleGroupImplMultiple {...(rest as unknown as ScopedProps<ToggleGroupImplMultipleProps>)} />;
  }

  throw new Error(`Missing prop \`type\` expected on \`${TOGGLE_GROUP_NAME}\``);
}

/* -------------------------------------------------------------------------------------------------
 * ToggleGroupValueContext
 * -----------------------------------------------------------------------------------------------*/

type ToggleGroupValueContextValue = {
  type: 'single' | 'multiple';
  value: string[];
  onItemActivate(value: string): void;
  onItemDeactivate(value: string): void;
};

const [ToggleGroupValueProvider, useToggleGroupValueContext] =
  createToggleGroupContext<ToggleGroupValueContextValue>(TOGGLE_GROUP_NAME);

/* -------------------------------------------------------------------------------------------------
 * ToggleGroupImplSingle
 * -----------------------------------------------------------------------------------------------*/

interface ToggleGroupImplSingleProps extends ToggleGroupImplProps {
  /**
   * The controlled stateful value of the item that is pressed.
   */
  value?: string;
  /**
   * The value of the item that is pressed when initially rendered. Use
   * `defaultValue` if you do not need to control the state of a toggle group.
   */
  defaultValue?: string;
  /**
   * The callback that fires when the value of the toggle group changes.
   */
  onValueChange?(value: string): void;
}

function ToggleGroupImplSingle(inProps: ScopedProps<ToggleGroupImplSingleProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeToggleGroup',
    'value',
    'defaultValue',
    'onValueChange',
  ]);

  const [value, setValue] = createControllableSignal({
    prop: () => local.value,
    defaultProp: local.defaultValue ?? '',
    onChange: local.onValueChange,
    caller: TOGGLE_GROUP_NAME,
  });

  return (
    <ToggleGroupValueProvider
      scope={local.__scopeToggleGroup}
      type="single"
      value={value() ? [value() as string] : []}
      onItemActivate={setValue}
      onItemDeactivate={() => setValue('')}
    >
      <ToggleGroupImpl __scopeToggleGroup={local.__scopeToggleGroup} {...rest} />
    </ToggleGroupValueProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToggleGroupImplMultiple
 * -----------------------------------------------------------------------------------------------*/

interface ToggleGroupImplMultipleProps extends ToggleGroupImplProps {
  /**
   * The controlled stateful value of the items that are pressed.
   */
  value?: string[];
  /**
   * The value of the items that are pressed when initially rendered. Use
   * `defaultValue` if you do not need to control the state of a toggle group.
   */
  defaultValue?: string[];
  /**
   * The callback that fires when the state of the toggle group changes.
   */
  onValueChange?(value: string[]): void;
}

function ToggleGroupImplMultiple(inProps: ScopedProps<ToggleGroupImplMultipleProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeToggleGroup',
    'value',
    'defaultValue',
    'onValueChange',
  ]);

  const [value, setValue] = createControllableSignal({
    prop: () => local.value,
    defaultProp: local.defaultValue ?? ([] as string[]),
    onChange: local.onValueChange,
    caller: TOGGLE_GROUP_NAME,
  });

  const handleItemActivate = (itemValue: string) => {
    setValue((prevValue = []) => [...prevValue, itemValue]);
  };

  const handleItemDeactivate = (itemValue: string) => {
    setValue((prevValue = []) => prevValue.filter((v) => v !== itemValue));
  };

  return (
    <ToggleGroupValueProvider
      scope={local.__scopeToggleGroup}
      type="multiple"
      value={value() as string[]}
      onItemActivate={handleItemActivate}
      onItemDeactivate={handleItemDeactivate}
    >
      <ToggleGroupImpl __scopeToggleGroup={local.__scopeToggleGroup} {...rest} />
    </ToggleGroupValueProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToggleGroupContext
 * -----------------------------------------------------------------------------------------------*/

type ToggleGroupContextValue = {
  rovingFocus: boolean;
  disabled: boolean;
};

const [ToggleGroupContext, useToggleGroupContext] =
  createToggleGroupContext<ToggleGroupContextValue>(TOGGLE_GROUP_NAME);

/* -------------------------------------------------------------------------------------------------
 * ToggleGroupImpl
 * -----------------------------------------------------------------------------------------------*/

interface ToggleGroupImplProps extends PrimitiveProps<'div'> {
  /**
   * Whether the group is disabled from user interaction.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Whether the group should maintain roving focus of its buttons.
   * @defaultValue true
   */
  rovingFocus?: boolean;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
}

function ToggleGroupImpl(inProps: ScopedProps<ToggleGroupImplProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeToggleGroup',
    'disabled',
    'rovingFocus',
    'orientation',
    'dir',
    'loop',
  ]);

  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeToggleGroup);
  const direction = useDirection(local.dir);

  return (
    <ToggleGroupContext
      scope={local.__scopeToggleGroup}
      rovingFocus={local.rovingFocus ?? true}
      disabled={local.disabled ?? false}
    >
      <Show
        when={local.rovingFocus ?? true}
        fallback={<Primitive.div role="group" dir={direction} {...rest} />}
      >
        <RovingFocusGroup
          asChild
          {...rovingFocusGroupScope}
          orientation={local.orientation}
          dir={direction}
          loop={local.loop ?? true}
        >
          <Primitive.div role="group" dir={direction} {...rest} />
        </RovingFocusGroup>
      </Show>
    </ToggleGroupContext>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToggleGroupItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'ToggleGroupItem';

interface ToggleGroupItemProps extends Omit<ToggleGroupItemImplProps, 'pressed'> {}

function ToggleGroupItem(inProps: ScopedProps<ToggleGroupItemProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeToggleGroup',
    'value',
    'disabled',
  ]);

  const valueContext = useToggleGroupValueContext(ITEM_NAME, local.__scopeToggleGroup);
  const context = useToggleGroupContext(ITEM_NAME, local.__scopeToggleGroup);
  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeToggleGroup);

  const pressed = () => valueContext.value.includes(local.value);
  const disabled = () => context.disabled || local.disabled;

  return (
    <Show
      when={context.rovingFocus}
      fallback={
        <ToggleGroupItemImpl
          __scopeToggleGroup={local.__scopeToggleGroup}
          value={local.value}
          pressed={pressed()}
          disabled={disabled()}
          {...rest}
        />
      }
    >
      <RovingFocusGroupItem
        asChild
        {...rovingFocusGroupScope}
        focusable={!disabled()}
        active={pressed()}
      >
        <ToggleGroupItemImpl
          __scopeToggleGroup={local.__scopeToggleGroup}
          value={local.value}
          pressed={pressed()}
          disabled={disabled()}
          {...rest}
        />
      </RovingFocusGroupItem>
    </Show>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToggleGroupItemImpl
 * -----------------------------------------------------------------------------------------------*/

interface ToggleGroupItemImplProps
  extends Omit<ToggleProps, 'defaultPressed' | 'onPressedChange'> {
  /**
   * A string value for the toggle group item. All items within a toggle group
   * should use a unique value.
   */
  value: string;
}

function ToggleGroupItemImpl(inProps: ScopedProps<ToggleGroupItemImplProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeToggleGroup', 'value']);
  const valueContext = useToggleGroupValueContext(ITEM_NAME, local.__scopeToggleGroup);

  const singleProps = () =>
    ({
      role: 'radio' as const,
      'aria-checked': rest.pressed,
      'aria-pressed': undefined,
    }) as const;

  return (
    <Toggle
      {...(valueContext.type === 'single' ? singleProps() : {})}
      {...rest}
      onPressedChange={(pressed: boolean) => {
        if (pressed) {
          valueContext.onItemActivate(local.value);
        } else {
          valueContext.onItemDeactivate(local.value);
        }
      }}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = ToggleGroup;
const Item = ToggleGroupItem;

export {
  createToggleGroupScope,
  //
  ToggleGroup,
  ToggleGroupItem,
  //
  Root,
  Item,
};
export type { ToggleGroupSingleProps, ToggleGroupMultipleProps, ToggleGroupItemProps };
