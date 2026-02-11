import { type JSX, createSignal, createEffect, onCleanup, splitProps, createUniqueId } from 'solid-js';
import { composeEventHandlers } from '@radix-solid/primitive';
import { createCollection } from '@radix-solid/collection';
import { mergeRefs } from '@radix-solid/compose-refs';
import { createContextScope, type Scope } from '@radix-solid/context';
import { useDirection } from '@radix-solid/direction';
import { Primitive } from '@radix-solid/primitive-component';
import { createControllableSignal } from '@radix-solid/use-controllable-state';

const ENTRY_FOCUS = 'rovingFocusGroup.onEntryFocus';
const EVENT_OPTIONS = { bubbles: false, cancelable: true };

const GROUP_NAME = 'RovingFocusGroup';

type ItemData = { id: string; focusable: boolean; active: boolean };
const [Collection, useCollection, createCollectionScope] = createCollection<HTMLSpanElement, ItemData>(GROUP_NAME);

type ScopedProps<P> = P & { __scopeRovingFocusGroup?: Scope };
const [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(GROUP_NAME, [createCollectionScope]);

type Orientation = 'horizontal' | 'vertical';
type Direction = 'ltr' | 'rtl';

interface RovingContextValue {
  orientation?: Orientation;
  dir?: Direction;
  loop?: boolean;
  currentTabStopId: string | null;
  onItemFocus(tabStopId: string): void;
  onItemShiftTab(): void;
  onFocusableItemAdd(): void;
  onFocusableItemRemove(): void;
}

const [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext<RovingContextValue>(GROUP_NAME);

interface RovingFocusGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  orientation?: Orientation;
  dir?: Direction;
  loop?: boolean;
  currentTabStopId?: string | null;
  defaultCurrentTabStopId?: string;
  onCurrentTabStopIdChange?: (tabStopId: string | null) => void;
  onEntryFocus?: (event: Event) => void;
  preventScrollOnEntryFocus?: boolean;
  ref?: (el: HTMLElement) => void;
}

function RovingFocusGroup(inProps: ScopedProps<RovingFocusGroupProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeRovingFocusGroup', 'orientation', 'loop', 'dir',
    'currentTabStopId', 'defaultCurrentTabStopId', 'onCurrentTabStopIdChange',
    'onEntryFocus', 'preventScrollOnEntryFocus', 'ref',
  ]);

  // Provide Collection.Provider FIRST so the inner component can consume it.
  // In SolidJS, useCollection must be called within a rendered Collection.Provider.
  return (
    <Collection.Provider scope={local.__scopeRovingFocusGroup}>
      <RovingFocusGroupInner {...local} {...rest} />
    </Collection.Provider>
  );
}

/** Inner component that consumes the Collection provided by RovingFocusGroup */
function RovingFocusGroupInner(inProps: ScopedProps<RovingFocusGroupProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeRovingFocusGroup', 'orientation', 'loop', 'dir',
    'currentTabStopId', 'defaultCurrentTabStopId', 'onCurrentTabStopIdChange',
    'onEntryFocus', 'preventScrollOnEntryFocus', 'ref',
  ]);

  let containerRef!: HTMLElement;
  const direction = useDirection(local.dir);
  
  const [currentTabStopId, setCurrentTabStopId] = createControllableSignal({
    prop: () => local.currentTabStopId,
    defaultProp: local.defaultCurrentTabStopId ?? null,
    onChange: local.onCurrentTabStopIdChange,
    caller: GROUP_NAME,
  });
  
  const [isTabbingBackOut, setIsTabbingBackOut] = createSignal(false);
  const [focusableItemsCount, setFocusableItemsCount] = createSignal(0);
  let isClickFocusRef = false;

  const getItems = useCollection(local.__scopeRovingFocusGroup);

  createEffect(() => {
    if (containerRef && local.onEntryFocus) {
      containerRef.addEventListener(ENTRY_FOCUS, local.onEntryFocus);
      onCleanup(() => containerRef.removeEventListener(ENTRY_FOCUS, local.onEntryFocus!));
    }
  });

  return (
    <RovingFocusProvider
      scope={local.__scopeRovingFocusGroup}
      orientation={local.orientation}
      dir={direction}
      loop={local.loop ?? false}
      currentTabStopId={currentTabStopId() as string | null}
      onItemFocus={(id) => setCurrentTabStopId(id)}
      onItemShiftTab={() => setIsTabbingBackOut(true)}
      onFocusableItemAdd={() => setFocusableItemsCount((c) => c + 1)}
      onFocusableItemRemove={() => setFocusableItemsCount((c) => c - 1)}
    >
      <Collection.Slot scope={local.__scopeRovingFocusGroup}>
        <Primitive.div
          tabIndex={isTabbingBackOut() || focusableItemsCount() === 0 ? -1 : 0}
          data-orientation={local.orientation}
          {...rest}
          ref={mergeRefs(local.ref, (el: HTMLElement) => { containerRef = el; })}
          style={{ outline: 'none', ...(typeof rest.style === 'object' ? rest.style : {}) }}
          onMouseDown={composeEventHandlers(rest.onMouseDown as any, () => { isClickFocusRef = true; })}
          onFocus={composeEventHandlers(rest.onFocus as any, (event: FocusEvent) => {
            const isKeyboardFocus = !isClickFocusRef;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut()) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
              (event.currentTarget as HTMLElement).dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item: any) => item.focusable);
                const activeItem = items.find((item: any) => item.active);
                const currentItem = items.find((item: any) => item.id === currentTabStopId());
                const candidateItems = [activeItem, currentItem, ...items].filter(Boolean);
                const candidateNodes = candidateItems.map((item: any) => item.ref);
                focusFirst(candidateNodes, local.preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef = false;
          })}
          onBlur={composeEventHandlers(rest.onBlur as any, () => setIsTabbingBackOut(false))}
        />
      </Collection.Slot>
    </RovingFocusProvider>
  );
}

/* ----- RovingFocusGroupItem ----- */

interface RovingFocusItemProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
  tabStopId?: string;
  focusable?: boolean;
  active?: boolean;
  ref?: (el: HTMLElement) => void;
}

function RovingFocusGroupItem(inProps: ScopedProps<RovingFocusItemProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeRovingFocusGroup', 'focusable', 'active', 'tabStopId', 'ref',
  ]);

  const autoId = createUniqueId();
  const id = () => local.tabStopId || autoId;
  const context = useRovingFocusContext('RovingFocusGroupItem', local.__scopeRovingFocusGroup);
  const isCurrentTabStop = () => context.currentTabStopId === id();
  const getItems = useCollection(local.__scopeRovingFocusGroup);

  const focusable = () => local.focusable ?? true;

  createEffect(() => {
    if (focusable()) {
      context.onFocusableItemAdd();
      onCleanup(() => context.onFocusableItemRemove());
    }
  });

  return (
    <Collection.ItemSlot scope={local.__scopeRovingFocusGroup} id={id()} focusable={focusable()} active={local.active ?? false}>
      <Primitive.span
        tabIndex={isCurrentTabStop() ? 0 : -1}
        data-orientation={context.orientation}
        {...rest}
        ref={local.ref}
        onMouseDown={composeEventHandlers(rest.onMouseDown as any, (event: MouseEvent) => {
          if (!focusable()) event.preventDefault();
          else context.onItemFocus(id());
        })}
        onFocus={composeEventHandlers(rest.onFocus as any, () => context.onItemFocus(id()))}
        onKeyDown={composeEventHandlers(rest.onKeyDown as any, (event: KeyboardEvent) => {
          if (event.key === 'Tab' && event.shiftKey) {
            context.onItemShiftTab();
            return;
          }
          if (event.target !== event.currentTarget) return;
          const focusIntent = getFocusIntent(event, context.orientation, context.dir);
          if (focusIntent !== undefined) {
            if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
            event.preventDefault();
            const items = getItems().filter((item: any) => item.focusable);
            let candidateNodes = items.map((item: any) => item.ref);
            if (focusIntent === 'last') candidateNodes.reverse();
            else if (focusIntent === 'prev' || focusIntent === 'next') {
              if (focusIntent === 'prev') candidateNodes.reverse();
              const currentIndex = candidateNodes.indexOf(event.currentTarget as HTMLElement);
              candidateNodes = context.loop
                ? wrapArray(candidateNodes, currentIndex + 1)
                : candidateNodes.slice(currentIndex + 1);
            }
            setTimeout(() => focusFirst(candidateNodes));
          }
        })}
      />
    </Collection.ItemSlot>
  );
}

/* ----- Utils ----- */

const MAP_KEY_TO_FOCUS_INTENT: Record<string, FocusIntent> = {
  ArrowLeft: 'prev', ArrowUp: 'prev',
  ArrowRight: 'next', ArrowDown: 'next',
  PageUp: 'first', Home: 'first',
  PageDown: 'last', End: 'last',
};

type FocusIntent = 'first' | 'last' | 'prev' | 'next';

function getDirectionAwareKey(key: string, dir?: Direction) {
  if (dir !== 'rtl') return key;
  return key === 'ArrowLeft' ? 'ArrowRight' : key === 'ArrowRight' ? 'ArrowLeft' : key;
}

function getFocusIntent(event: KeyboardEvent, orientation?: Orientation | string, dir?: Direction | string) {
  const key = getDirectionAwareKey(event.key, dir as Direction);
  if (orientation === 'vertical' && ['ArrowLeft', 'ArrowRight'].includes(key)) return undefined;
  if (orientation === 'horizontal' && ['ArrowUp', 'ArrowDown'].includes(key)) return undefined;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}

function focusFirst(candidates: HTMLElement[], preventScroll = false) {
  const prev = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === prev) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== prev) return;
  }
}

function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>((_, index) => array[(startIndex + index) % array.length]!);
}

export { createRovingFocusGroupScope, RovingFocusGroup, RovingFocusGroupItem };
export type { RovingFocusGroupProps, RovingFocusItemProps };
