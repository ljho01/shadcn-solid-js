import {
  type JSX,
  createSignal,
  createEffect,
  onCleanup,
  splitProps,
  createMemo,
} from 'solid-js';
import { composeEventHandlers } from '@radix-solid/primitive';
import { mergeRefs } from '@radix-solid/compose-refs';
import { createContextScope, type Scope } from '@radix-solid/context';
import { DismissableLayer } from '@radix-solid/dismissable-layer';
import { createId } from '@radix-solid/id';
import { Presence } from '@radix-solid/presence';
import { Primitive } from '@radix-solid/primitive-component';
import { createControllableSignal } from '@radix-solid/use-controllable-state';
import { createPrevious } from '@radix-solid/use-previous';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu
 * -----------------------------------------------------------------------------------------------*/

const NAVIGATION_MENU_NAME = 'NavigationMenu';

type ScopedProps<P> = P & { __scopeNavigationMenu?: Scope };
const [createNavigationMenuContext, createNavigationMenuScope] =
  createContextScope(NAVIGATION_MENU_NAME);

type NavigationMenuContextValue = {
  isRootMenu: boolean;
  value: string;
  previousValue: string;
  onValueChange: (value: string) => void;
  baseId: string;
  dir: 'ltr' | 'rtl';
  orientation: 'horizontal' | 'vertical';
  rootNavigationMenu: HTMLElement | null;
  onRootNavigationMenuChange: (el: HTMLElement | null) => void;
  viewport: HTMLDivElement | null;
  onViewportChange: (el: HTMLDivElement | null) => void;
  indicatorTrack: HTMLDivElement | null;
  onIndicatorTrackChange: (el: HTMLDivElement | null) => void;
  onTriggerEnter: (itemValue: string) => void;
  onTriggerLeave: () => void;
  onContentEnter: () => void;
  onContentLeave: () => void;
  onItemSelect: (itemValue: string) => void;
  onItemDismiss: () => void;
};

const [NavigationMenuProvider, useNavigationMenuContext] =
  createNavigationMenuContext<NavigationMenuContextValue>(NAVIGATION_MENU_NAME);

interface NavigationMenuProps extends JSX.HTMLAttributes<HTMLElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  dir?: 'ltr' | 'rtl';
  orientation?: 'horizontal' | 'vertical';
  delayDuration?: number;
  skipDelayDuration?: number;
  ref?: (el: HTMLElement) => void;
}

function NavigationMenu(inProps: ScopedProps<NavigationMenuProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeNavigationMenu',
    'ref',
    'value',
    'defaultValue',
    'onValueChange',
    'dir',
    'orientation',
    'delayDuration',
    'skipDelayDuration',
    'children',
  ]);

  const [rootNavMenu, setRootNavMenu] = createSignal<HTMLElement | null>(null);
  const [viewport, setViewport] = createSignal<HTMLDivElement | null>(null);
  const [indicatorTrack, setIndicatorTrack] = createSignal<HTMLDivElement | null>(null);

  const [value, setValue] = createControllableSignal({
    prop: () => local.value,
    defaultProp: local.defaultValue ?? '',
    onChange: (val) => local.onValueChange?.(val),
  });

  const previousValue = createPrevious(value);
  const dir = () => local.dir ?? 'ltr';
  const orientation = () => local.orientation ?? 'horizontal';
  const delayDuration = () => local.delayDuration ?? 200;
  const skipDelayDuration = () => local.skipDelayDuration ?? 300;
  const baseId = createId();

  let openTimerRef = 0;
  let closeTimerRef = 0;
  const [isDelaySkipped, setIsDelaySkipped] = createSignal(false);

  const handleOpen = (itemValue: string) => {
    window.clearTimeout(closeTimerRef);
    if (isDelaySkipped() || delayDuration() <= 0) {
      setValue(itemValue);
    } else {
      openTimerRef = window.setTimeout(() => setValue(itemValue), delayDuration());
    }
  };

  const handleClose = () => {
    window.clearTimeout(openTimerRef);
    closeTimerRef = window.setTimeout(() => {
      setValue('');
      setIsDelaySkipped(true);
      window.setTimeout(() => setIsDelaySkipped(false), skipDelayDuration());
    }, 150);
  };

  onCleanup(() => {
    window.clearTimeout(openTimerRef);
    window.clearTimeout(closeTimerRef);
  });

  return (
    <NavigationMenuProvider
      scope={local.__scopeNavigationMenu}
      isRootMenu={true}
      value={value()}
      previousValue={previousValue()}
      onValueChange={setValue}
      baseId={baseId}
      dir={dir()}
      orientation={orientation()}
      rootNavigationMenu={rootNavMenu()}
      onRootNavigationMenuChange={setRootNavMenu}
      viewport={viewport()}
      onViewportChange={setViewport}
      indicatorTrack={indicatorTrack()}
      onIndicatorTrackChange={setIndicatorTrack}
      onTriggerEnter={handleOpen}
      onTriggerLeave={handleClose}
      onContentEnter={() => window.clearTimeout(closeTimerRef)}
      onContentLeave={handleClose}
      onItemSelect={(itemValue) => {
        setValue(itemValue === value() ? '' : itemValue);
      }}
      onItemDismiss={() => setValue('')}
    >
      <Primitive.nav
        aria-label="Main"
        data-orientation={orientation()}
        dir={dir()}
        {...rest}
        ref={mergeRefs(local.ref, setRootNavMenu)}
      >
        {local.children}
      </Primitive.nav>
    </NavigationMenuProvider>
  );
}

NavigationMenu.displayName = NAVIGATION_MENU_NAME;

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuSub
 * -----------------------------------------------------------------------------------------------*/

const SUB_NAME = 'NavigationMenuSub';

interface NavigationMenuSubProps {
  children?: JSX.Element;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

function NavigationMenuSub(inProps: ScopedProps<NavigationMenuSubProps>) {
  const [local] = splitProps(inProps, [
    '__scopeNavigationMenu',
    'children',
    'value',
    'defaultValue',
    'onValueChange',
    'orientation',
  ]);

  const parentContext = useNavigationMenuContext(SUB_NAME, local.__scopeNavigationMenu);

  const [value, setValue] = createControllableSignal({
    prop: () => local.value,
    defaultProp: local.defaultValue ?? '',
    onChange: (val) => local.onValueChange?.(val),
  });

  const previousValue = createPrevious(value);

  return (
    <NavigationMenuProvider
      scope={local.__scopeNavigationMenu}
      isRootMenu={false}
      value={value()}
      previousValue={previousValue()}
      onValueChange={setValue}
      baseId={parentContext.baseId}
      dir={parentContext.dir}
      orientation={local.orientation ?? 'horizontal'}
      rootNavigationMenu={parentContext.rootNavigationMenu}
      onRootNavigationMenuChange={parentContext.onRootNavigationMenuChange}
      viewport={parentContext.viewport}
      onViewportChange={parentContext.onViewportChange}
      indicatorTrack={parentContext.indicatorTrack}
      onIndicatorTrackChange={parentContext.onIndicatorTrackChange}
      onTriggerEnter={(itemValue) => setValue(itemValue)}
      onTriggerLeave={() => setValue('')}
      onContentEnter={() => {}}
      onContentLeave={() => setValue('')}
      onItemSelect={(itemValue) => {
        setValue(itemValue === value() ? '' : itemValue);
      }}
      onItemDismiss={() => setValue('')}
    >
      {local.children}
    </NavigationMenuProvider>
  );
}

NavigationMenuSub.displayName = SUB_NAME;

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuList
 * -----------------------------------------------------------------------------------------------*/

const LIST_NAME = 'NavigationMenuList';

interface NavigationMenuListProps extends JSX.HTMLAttributes<HTMLUListElement> {
  ref?: (el: HTMLElement) => void;
}

function NavigationMenuList(inProps: ScopedProps<NavigationMenuListProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeNavigationMenu', 'ref']);
  const context = useNavigationMenuContext(LIST_NAME, local.__scopeNavigationMenu);

  return (
    <Primitive.ul
      data-orientation={context.orientation}
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) => context.onIndicatorTrackChange(el as HTMLDivElement))}
    />
  );
}

NavigationMenuList.displayName = LIST_NAME;

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'NavigationMenuItem';

type ItemContextValue = {
  value: string;
  triggerRef: HTMLButtonElement | null;
  onTriggerRefChange: (el: HTMLButtonElement | null) => void;
  contentRef: HTMLDivElement | null;
  onContentRefChange: (el: HTMLDivElement | null) => void;
  wasEscapeClose: boolean;
  onEntryKeyDown: () => void;
  onFocusProxyEnter: (side: 'start' | 'end') => void;
  onRootContentClose: () => void;
  onContentFocusOutside: () => void;
};

const [NavigationMenuItemProvider, useNavigationMenuItemContext] =
  createNavigationMenuContext<ItemContextValue>(ITEM_NAME);

interface NavigationMenuItemProps extends JSX.HTMLAttributes<HTMLLIElement> {
  value?: string;
  ref?: (el: HTMLElement) => void;
}

function NavigationMenuItem(inProps: ScopedProps<NavigationMenuItemProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeNavigationMenu', 'ref', 'value', 'children']);
  const autoValue = createId();
  const itemValue = () => local.value ?? autoValue;

  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement | null>(null);
  const [contentRef, setContentRef] = createSignal<HTMLDivElement | null>(null);
  let wasEscapeClose = false;

  return (
    <NavigationMenuItemProvider
      scope={local.__scopeNavigationMenu}
      value={itemValue()}
      triggerRef={triggerRef()}
      onTriggerRefChange={setTriggerRef}
      contentRef={contentRef()}
      onContentRefChange={setContentRef}
      wasEscapeClose={wasEscapeClose}
      onEntryKeyDown={() => {}}
      onFocusProxyEnter={() => {}}
      onRootContentClose={() => {}}
      onContentFocusOutside={() => {}}
    >
      <Primitive.li {...rest} ref={local.ref}>
        {local.children}
      </Primitive.li>
    </NavigationMenuItemProvider>
  );
}

NavigationMenuItem.displayName = ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'NavigationMenuTrigger';

interface NavigationMenuTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function NavigationMenuTrigger(inProps: ScopedProps<NavigationMenuTriggerProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeNavigationMenu', 'ref', 'children']);
  const context = useNavigationMenuContext(TRIGGER_NAME, local.__scopeNavigationMenu);
  const itemContext = useNavigationMenuItemContext(TRIGGER_NAME, local.__scopeNavigationMenu);

  const open = () => itemContext.value === context.value;
  const triggerId = makeTriggerId(context.baseId, itemContext.value);
  const contentId = makeContentId(context.baseId, itemContext.value);

  return (
    <Primitive.button
      id={triggerId}
      aria-expanded={open()}
      aria-controls={contentId}
      data-state={getOpenState(open())}
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) => itemContext.onTriggerRefChange(el as HTMLButtonElement))}
      onPointerEnter={composeEventHandlers(rest.onPointerEnter as any, () => {
        context.onTriggerEnter(itemContext.value);
      })}
      onPointerLeave={composeEventHandlers(rest.onPointerLeave as any, () => {
        context.onTriggerLeave();
      })}
      onClick={composeEventHandlers(rest.onClick as any, () => {
        context.onItemSelect(itemContext.value);
      })}
      onKeyDown={composeEventHandlers(rest.onKeyDown as any, (event: KeyboardEvent) => {
        const verticalEntryKey = context.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
        const entryKey = context.orientation === 'horizontal' ? 'ArrowDown' : verticalEntryKey;
        if (event.key === entryKey) {
          event.preventDefault();
          context.onItemSelect(itemContext.value);
        }
      })}
    >
      {local.children}
    </Primitive.button>
  );
}

NavigationMenuTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuLink
 * -----------------------------------------------------------------------------------------------*/

const LINK_NAME = 'NavigationMenuLink';

interface NavigationMenuLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  onSelect?: (event: Event) => void;
  ref?: (el: HTMLElement) => void;
}

function NavigationMenuLink(inProps: ScopedProps<NavigationMenuLinkProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeNavigationMenu', 'ref', 'active', 'onSelect']);
  const context = useNavigationMenuContext(LINK_NAME, local.__scopeNavigationMenu);

  return (
    <Primitive.a
      data-active={local.active ? '' : undefined}
      aria-current={local.active ? 'page' : undefined}
      {...rest}
      ref={local.ref}
      onClick={composeEventHandlers(rest.onClick as any, (event: Event) => {
        local.onSelect?.(event);
        if (!event.defaultPrevented) {
          context.onItemDismiss();
        }
      })}
    />
  );
}

NavigationMenuLink.displayName = LINK_NAME;

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'NavigationMenuContent';

interface NavigationMenuContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  forceMount?: true;
  ref?: (el: HTMLElement) => void;
}

function NavigationMenuContent(inProps: ScopedProps<NavigationMenuContentProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeNavigationMenu', 'ref', 'forceMount', 'children']);
  const context = useNavigationMenuContext(CONTENT_NAME, local.__scopeNavigationMenu);
  const itemContext = useNavigationMenuItemContext(CONTENT_NAME, local.__scopeNavigationMenu);

  const open = () => itemContext.value === context.value;
  const contentId = makeContentId(context.baseId, itemContext.value);
  const triggerId = makeTriggerId(context.baseId, itemContext.value);

  // Determine motion direction for animation
  const motionAttribute = createMemo(() => {
    const items = context.value;
    const prevItems = context.previousValue;
    if (!items) return undefined;
    if (items && !prevItems) return undefined;
    // Simple heuristic - could be enhanced
    return undefined;
  });

  return (
    <Presence present={local.forceMount || open()}>
      <DismissableLayer
        asChild
        disableOutsidePointerEvents={false}
        onEscapeKeyDown={() => {
          context.onItemDismiss();
        }}
        onPointerDownOutside={(event: any) => {
          // Don't dismiss if pointer is on trigger
          const target = event.target as HTMLElement;
          if (itemContext.triggerRef?.contains(target)) {
            event.preventDefault();
          }
        }}
        onFocusOutside={(event: any) => {
          event.preventDefault();
        }}
        onDismiss={() => context.onItemDismiss()}
      >
        <Primitive.div
          id={contentId}
          aria-labelledby={triggerId}
          data-state={getOpenState(open())}
          data-orientation={context.orientation}
          data-motion={motionAttribute()}
          {...rest}
          ref={mergeRefs(local.ref, (el: HTMLElement) => itemContext.onContentRefChange(el as HTMLDivElement))}
          onPointerEnter={composeEventHandlers(rest.onPointerEnter as any, () => {
            context.onContentEnter();
          })}
          onPointerLeave={composeEventHandlers(rest.onPointerLeave as any, () => {
            context.onContentLeave();
          })}
        >
          {local.children}
        </Primitive.div>
      </DismissableLayer>
    </Presence>
  );
}

NavigationMenuContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = 'NavigationMenuIndicator';

interface NavigationMenuIndicatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  forceMount?: true;
  ref?: (el: HTMLElement) => void;
}

function NavigationMenuIndicator(inProps: ScopedProps<NavigationMenuIndicatorProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeNavigationMenu', 'ref', 'forceMount', 'children', 'style']);
  const context = useNavigationMenuContext(INDICATOR_NAME, local.__scopeNavigationMenu);

  const isVisible = () => Boolean(context.value);
  const [position, setPosition] = createSignal<{ size: number; offset: number } | null>(null);

  // Update indicator position based on active trigger
  createEffect(() => {
    const activeValue = context.value;
    const track = context.indicatorTrack;
    if (!activeValue || !track) {
      setPosition(null);
      return;
    }

    // Find the trigger for the active item
    const triggerId = makeTriggerId(context.baseId, activeValue);
    const trigger = document.getElementById(triggerId);
    if (!trigger) {
      setPosition(null);
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();

    const isHorizontal = context.orientation === 'horizontal';
    setPosition({
      size: isHorizontal ? triggerRect.width : triggerRect.height,
      offset: isHorizontal
        ? triggerRect.left - trackRect.left
        : triggerRect.top - trackRect.top,
    });
  });

  return (
    <Presence present={local.forceMount || isVisible()}>
      <Primitive.div
        aria-hidden
        data-state={isVisible() ? 'visible' : 'hidden'}
        data-orientation={context.orientation}
        {...rest}
        ref={local.ref}
        style={{
          position: 'absolute',
          ...(context.orientation === 'horizontal'
            ? {
                left: '0',
                width: position() ? `${position()!.size}px` : undefined,
                transform: position() ? `translateX(${position()!.offset}px)` : undefined,
              }
            : {
                top: '0',
                height: position() ? `${position()!.size}px` : undefined,
                transform: position() ? `translateY(${position()!.offset}px)` : undefined,
              }),
          ...(typeof local.style === 'object' ? local.style : {}),
        }}
      >
        {local.children}
      </Primitive.div>
    </Presence>
  );
}

NavigationMenuIndicator.displayName = INDICATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuViewport
 * -----------------------------------------------------------------------------------------------*/

const VIEWPORT_NAME = 'NavigationMenuViewport';

interface NavigationMenuViewportProps extends JSX.HTMLAttributes<HTMLDivElement> {
  forceMount?: true;
  ref?: (el: HTMLElement) => void;
}

function NavigationMenuViewport(inProps: ScopedProps<NavigationMenuViewportProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeNavigationMenu', 'ref', 'forceMount', 'style', 'children']);
  const context = useNavigationMenuContext(VIEWPORT_NAME, local.__scopeNavigationMenu);

  const open = () => Boolean(context.value);
  const [size] = createSignal<{ width: number; height: number } | null>(null);

  return (
    <Presence present={local.forceMount || open()}>
      <Primitive.div
        data-state={getOpenState(open())}
        data-orientation={context.orientation}
        {...rest}
        ref={mergeRefs(local.ref, (el: HTMLElement) => context.onViewportChange(el as HTMLDivElement))}
        style={{
          // Expose content size for animation
          '--radix-navigation-menu-viewport-width': size() ? `${size()!.width}px` : undefined,
          '--radix-navigation-menu-viewport-height': size() ? `${size()!.height}px` : undefined,
          ...(typeof local.style === 'object' ? local.style : {}),
        } as JSX.CSSProperties}
      >
        {local.children}
      </Primitive.div>
    </Presence>
  );
}

NavigationMenuViewport.displayName = VIEWPORT_NAME;

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------------------------*/

function getOpenState(open: boolean) {
  return open ? 'open' : 'closed';
}

function makeTriggerId(baseId: string, value: string) {
  return `${baseId}-trigger-${value}`;
}

function makeContentId(baseId: string, value: string) {
  return `${baseId}-content-${value}`;
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = NavigationMenu;
const Sub = NavigationMenuSub;
const List = NavigationMenuList;
const Item = NavigationMenuItem;
const Trigger = NavigationMenuTrigger;
const Link = NavigationMenuLink;
const Content = NavigationMenuContent;
const Indicator = NavigationMenuIndicator;
const Viewport = NavigationMenuViewport;

export {
  createNavigationMenuScope,
  //
  NavigationMenu,
  NavigationMenuSub,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  //
  Root,
  Sub,
  List,
  Item,
  Trigger,
  Link,
  Content,
  Indicator,
  Viewport,
};
export type {
  NavigationMenuProps,
  NavigationMenuSubProps,
  NavigationMenuListProps,
  NavigationMenuItemProps,
  NavigationMenuTriggerProps,
  NavigationMenuLinkProps,
  NavigationMenuContentProps,
  NavigationMenuIndicatorProps,
  NavigationMenuViewportProps,
};
