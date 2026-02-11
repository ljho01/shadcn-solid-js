import { type JSX, createEffect, splitProps, Show } from 'solid-js';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { createContextScope } from '@radix-solid-js/context';
import { createRovingFocusGroupScope, RovingFocusGroup, RovingFocusGroupItem } from '@radix-solid-js/roving-focus';
import { Presence } from '@radix-solid-js/presence';
import { Primitive, type PrimitiveProps } from '@radix-solid-js/primitive-component';
import { useDirection } from '@radix-solid-js/direction';
import { createControllableSignal } from '@radix-solid-js/use-controllable-state';
import { createId } from '@radix-solid-js/id';

import type { Scope } from '@radix-solid-js/context';

/* -------------------------------------------------------------------------------------------------
 * Tabs
 * -----------------------------------------------------------------------------------------------*/

const TABS_NAME = 'Tabs';

type ScopedProps<P> = P & { __scopeTabs?: Scope };
const [createTabsContext, createTabsScope] = createContextScope(TABS_NAME, [
  createRovingFocusGroupScope,
]);
const useRovingFocusGroupScope = createRovingFocusGroupScope();

type TabsContextValue = {
  baseId: string;
  value: string;
  onValueChange: (value: string) => void;
  orientation?: TabsProps['orientation'];
  dir?: TabsProps['dir'];
  activationMode?: TabsProps['activationMode'];
};

const [TabsProvider, useTabsContext] = createTabsContext<TabsContextValue>(TABS_NAME);

type RovingFocusGroupProps = {
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
  loop?: boolean;
};

interface TabsProps extends PrimitiveProps<'div'> {
  /** The value for the selected tab, if controlled */
  value?: string;
  /** The value of the tab to select by default, if uncontrolled */
  defaultValue?: string;
  /** A function called when a new tab is selected */
  onValueChange?: (value: string) => void;
  /**
   * The orientation the tabs are layed out.
   * Mainly so arrow navigation is done accordingly (left & right vs. up & down)
   * @defaultValue horizontal
   */
  orientation?: RovingFocusGroupProps['orientation'];
  /**
   * The direction of navigation between toolbar items.
   */
  dir?: RovingFocusGroupProps['dir'];
  /**
   * Whether a tab is activated automatically or manually.
   * @defaultValue automatic
   */
  activationMode?: 'automatic' | 'manual';
}

function Tabs(inProps: ScopedProps<TabsProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeTabs',
    'value',
    'onValueChange',
    'defaultValue',
    'orientation',
    'dir',
    'activationMode',
  ]);

  const direction = useDirection(local.dir);
  const [value, setValue] = createControllableSignal({
    prop: () => local.value,
    defaultProp: local.defaultValue ?? '',
    onChange: local.onValueChange,
    caller: TABS_NAME,
  });

  return (
    <TabsProvider
      scope={local.__scopeTabs}
      baseId={createId()}
      value={value() as string}
      onValueChange={setValue}
      orientation={local.orientation ?? 'horizontal'}
      dir={direction}
      activationMode={local.activationMode ?? 'automatic'}
    >
      <Primitive.div
        dir={direction}
        data-orientation={local.orientation ?? 'horizontal'}
        {...rest}
      />
    </TabsProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * TabsList
 * -----------------------------------------------------------------------------------------------*/

const TAB_LIST_NAME = 'TabsList';

interface TabsListProps extends PrimitiveProps<'div'> {
  loop?: RovingFocusGroupProps['loop'];
}

function TabsList(inProps: ScopedProps<TabsListProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeTabs', 'loop']);
  const context = useTabsContext(TAB_LIST_NAME, local.__scopeTabs);
  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeTabs);

  return (
    <RovingFocusGroup
      asChild
      {...rovingFocusGroupScope}
      orientation={context.orientation}
      dir={context.dir}
      loop={local.loop ?? true}
    >
      <Primitive.div
        role="tablist"
        aria-orientation={context.orientation}
        {...rest}
      />
    </RovingFocusGroup>
  );
}

/* -------------------------------------------------------------------------------------------------
 * TabsTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'TabsTrigger';

interface TabsTriggerProps extends PrimitiveProps<'button'> {
  value: string;
}

function TabsTrigger(inProps: ScopedProps<TabsTriggerProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeTabs',
    'value',
    'disabled',
  ]);

  const context = useTabsContext(TRIGGER_NAME, local.__scopeTabs);
  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeTabs);
  const triggerId = () => makeTriggerId(context.baseId, local.value);
  const contentId = () => makeContentId(context.baseId, local.value);
  const isSelected = () => local.value === context.value;

  return (
    <RovingFocusGroupItem
      asChild
      {...rovingFocusGroupScope}
      focusable={!local.disabled}
      active={isSelected()}
    >
      <Primitive.button
        type="button"
        role="tab"
        aria-selected={isSelected()}
        aria-controls={contentId()}
        data-state={isSelected() ? 'active' : 'inactive'}
        data-disabled={local.disabled ? '' : undefined}
        disabled={local.disabled}
        id={triggerId()}
        {...rest}
        onMouseDown={composeEventHandlers(
          rest.onMouseDown as JSX.EventHandler<HTMLButtonElement, MouseEvent>,
          (event: MouseEvent) => {
            // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
            // but not when the control key is pressed (avoiding MacOS right click)
            if (!local.disabled && event.button === 0 && event.ctrlKey === false) {
              context.onValueChange(local.value);
            } else {
              // prevent focus to avoid accidental activation
              event.preventDefault();
            }
          }
        )}
        onKeyDown={composeEventHandlers(
          rest.onKeyDown as JSX.EventHandler<HTMLButtonElement, KeyboardEvent>,
          (event: KeyboardEvent) => {
            if ([' ', 'Enter'].includes(event.key)) context.onValueChange(local.value);
          }
        )}
        onFocus={composeEventHandlers(
          rest.onFocus as JSX.EventHandler<HTMLButtonElement, FocusEvent>,
          () => {
            // handle "automatic" activation if necessary
            // ie. activate tab following focus
            const isAutomaticActivation = context.activationMode !== 'manual';
            if (!isSelected() && !local.disabled && isAutomaticActivation) {
              context.onValueChange(local.value);
            }
          }
        )}
      />
    </RovingFocusGroupItem>
  );
}

/* -------------------------------------------------------------------------------------------------
 * TabsContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'TabsContent';

interface TabsContentProps extends PrimitiveProps<'div'> {
  value: string;

  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with SolidJS animation libraries.
   */
  forceMount?: true;
}

function TabsContent(inProps: ScopedProps<TabsContentProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeTabs',
    'value',
    'forceMount',
    'children',
    'style',
  ]);

  const context = useTabsContext(CONTENT_NAME, local.__scopeTabs);
  const triggerId = () => makeTriggerId(context.baseId, local.value);
  const contentId = () => makeContentId(context.baseId, local.value);
  const isSelected = () => local.value === context.value;

  // Prevent mount animation on initial render.
  // The variable persists in the TabsContent closure (which runs once),
  // while Presence may mount/unmount the inner DOM.
  // After the first animation frame, subsequent mounts will allow animations.
  let isMountAnimationPrevented = isSelected();

  createEffect(() => {
    const rAF = requestAnimationFrame(() => {
      isMountAnimationPrevented = false;
    });
    return () => cancelAnimationFrame(rAF);
  });

  return (
    <Presence present={local.forceMount || isSelected()}>
      <Primitive.div
        data-state={isSelected() ? 'active' : 'inactive'}
        data-orientation={context.orientation}
        role="tabpanel"
        aria-labelledby={triggerId()}
        hidden={!isSelected()}
        id={contentId()}
        tabIndex={0}
        {...rest}
        style={{
          ...(typeof local.style === 'object' ? local.style : {}),
          'animation-duration': isMountAnimationPrevented ? '0s' : undefined,
        } as JSX.CSSProperties}
      >
        <Show when={isSelected()}>
          {local.children}
        </Show>
      </Primitive.div>
    </Presence>
  );
}

/* ---------------------------------------------------------------------------------------------- */

function makeTriggerId(baseId: string, value: string) {
  return `${baseId}-trigger-${value}`;
}

function makeContentId(baseId: string, value: string) {
  return `${baseId}-content-${value}`;
}

const Root = Tabs;
const List = TabsList;
const Trigger = TabsTrigger;
const Content = TabsContent;

export {
  createTabsScope,
  //
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  //
  Root,
  List,
  Trigger,
  Content,
};
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps };
