import { type JSX, splitProps, createSignal, createEffect } from 'solid-js';
import { createCollection } from '@radix-solid-js/collection';
import { useDirection } from '@radix-solid-js/direction';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { mergeRefs } from '@radix-solid-js/compose-refs';
import { createContextScope, type Scope } from '@radix-solid-js/context';
import { createId } from '@radix-solid-js/id';
import * as MenuPrimitive from '@radix-solid-js/menu';
import { createMenuScope } from '@radix-solid-js/menu';
import { RovingFocusGroup, RovingFocusGroupItem, createRovingFocusGroupScope } from '@radix-solid-js/roving-focus';
import { Primitive } from '@radix-solid-js/primitive-component';
import { createControllableSignal } from '@radix-solid-js/use-controllable-state';

import type { Direction } from '@radix-solid-js/direction';

/* -------------------------------------------------------------------------------------------------
 * Menubar
 * -----------------------------------------------------------------------------------------------*/

const MENUBAR_NAME = 'Menubar';

type ItemData = { value: string; disabled: boolean };
const [Collection, useCollection, createCollectionScope] = createCollection<
  HTMLButtonElement,
  ItemData
>(MENUBAR_NAME);

type ScopedProps<P> = P & { __scopeMenubar?: Scope };
const [createMenubarContext, createMenubarScope] = createContextScope(MENUBAR_NAME, [
  createCollectionScope,
  createRovingFocusGroupScope,
]);

const useMenuScope = createMenuScope();
const useRovingFocusGroupScope = createRovingFocusGroupScope();

type MenubarContextValue = {
  value: string;
  dir: Direction;
  loop: boolean;
  onMenuOpen(value: string): void;
  onMenuClose(): void;
  onMenuToggle(value: string): void;
};

const [MenubarContextProvider, useMenubarContext] =
  createMenubarContext<MenubarContextValue>(MENUBAR_NAME);

interface MenubarProps extends JSX.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  loop?: boolean;
  dir?: Direction;
  ref?: (el: HTMLElement) => void;
}

function Menubar(inProps: ScopedProps<MenubarProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeMenubar',
    'value',
    'onValueChange',
    'defaultValue',
    'loop',
    'dir',
    'ref',
  ]);
  const direction = useDirection(local.dir);
  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeMenubar);
  const [value, setValue] = createControllableSignal({
    prop: () => local.value,
    onChange: local.onValueChange,
    defaultProp: local.defaultValue ?? '',
    caller: MENUBAR_NAME,
  });
  const loop = () => local.loop ?? true;

  // We need to manage tab stop id manually as `RovingFocusGroup` updates the stop
  // based on focus, and in some situations our triggers won't ever be given focus
  // (e.g. click to open and then outside to close)
  const [currentTabStopId, setCurrentTabStopId] = createSignal<string | null>(null);

  return (
    <MenubarContextProvider
      scope={local.__scopeMenubar}
      value={value()}
      onMenuOpen={(menuValue: string) => {
        setValue(menuValue);
        setCurrentTabStopId(menuValue);
      }}
      onMenuClose={() => setValue('')}
      onMenuToggle={(menuValue: string) => {
        setValue((prevValue) => (prevValue ? '' : menuValue));
        // `onMenuOpen` and `onMenuToggle` are called exclusively so we
        // need to update the id in either case.
        setCurrentTabStopId(menuValue);
      }}
      dir={direction}
      loop={loop()}
    >
      <Collection.Provider scope={local.__scopeMenubar}>
        <Collection.Slot scope={local.__scopeMenubar}>
          <RovingFocusGroup
            {...rovingFocusGroupScope}
            orientation="horizontal"
            loop={loop()}
            dir={direction}
            currentTabStopId={currentTabStopId()}
            onCurrentTabStopIdChange={setCurrentTabStopId}
          >
            <Primitive.div role="menubar" {...rest} ref={local.ref} />
          </RovingFocusGroup>
        </Collection.Slot>
      </Collection.Provider>
    </MenubarContextProvider>
  );
}

Menubar.displayName = MENUBAR_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarMenu
 * -----------------------------------------------------------------------------------------------*/

const MENU_NAME = 'MenubarMenu';

type MenubarMenuContextValue = {
  value: string;
  triggerId: string;
  triggerRef: HTMLButtonElement | undefined;
  onTriggerRefChange: (el: HTMLButtonElement | undefined) => void;
  contentId: string;
  wasKeyboardTriggerOpen: boolean;
  setWasKeyboardTriggerOpen: (v: boolean) => void;
};

const [MenubarMenuProvider, useMenubarMenuContext] =
  createMenubarContext<MenubarMenuContextValue>(MENU_NAME);

interface MenubarMenuProps {
  value?: string;
  children?: JSX.Element;
}

function MenubarMenu(inProps: ScopedProps<MenubarMenuProps>) {
  const [local] = splitProps(inProps, ['__scopeMenubar', 'value', 'children']);
  const autoValue = createId();
  const value = () => local.value || autoValue;
  const context = useMenubarContext(MENU_NAME, local.__scopeMenubar);
  const menuScope = useMenuScope(local.__scopeMenubar);
  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement | undefined>(undefined);
  let wasKeyboardTriggerOpen = false;

  const open = () => context.value === value();

  createEffect(() => {
    if (!open()) wasKeyboardTriggerOpen = false;
  });

  return (
    <MenubarMenuProvider
      scope={local.__scopeMenubar}
      value={value()}
      triggerId={createId()}
      triggerRef={triggerRef()}
      onTriggerRefChange={setTriggerRef}
      contentId={createId()}
      wasKeyboardTriggerOpen={wasKeyboardTriggerOpen}
      setWasKeyboardTriggerOpen={(v: boolean) => { wasKeyboardTriggerOpen = v; }}
    >
      <MenuPrimitive.Menu
        {...menuScope}
        open={open()}
        onOpenChange={(openValue: boolean) => {
          // Menu only calls `onOpenChange` when dismissing so we
          // want to close our MenuBar based on the same events.
          if (!openValue) context.onMenuClose();
        }}
        modal={false}
        dir={context.dir}
      >
        {local.children}
      </MenuPrimitive.Menu>
    </MenubarMenuProvider>
  );
}

MenubarMenu.displayName = MENU_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'MenubarTrigger';

interface MenubarTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function MenubarTrigger(inProps: ScopedProps<MenubarTriggerProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeMenubar',
    'ref',
    'disabled',
    'onPointerDown',
    'onPointerEnter',
    'onKeyDown',
    'onFocus',
    'onBlur',
  ]);
  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeMenubar);
  const menuScope = useMenuScope(local.__scopeMenubar);
  const context = useMenubarContext(TRIGGER_NAME, local.__scopeMenubar);
  const menuContext = useMenubarMenuContext(TRIGGER_NAME, local.__scopeMenubar);
  let triggerRef: HTMLButtonElement | undefined;
  const [isFocused, setIsFocused] = createSignal(false);
  const disabled = () => local.disabled ?? false;
  const open = () => context.value === menuContext.value;

  return (
    <Collection.ItemSlot scope={local.__scopeMenubar} value={menuContext.value} disabled={disabled()}>
      <RovingFocusGroupItem
        {...rovingFocusGroupScope}
        focusable={!disabled()}
        tabStopId={menuContext.value}
      >
        <MenuPrimitive.MenuAnchor {...menuScope}>
          <Primitive.button
            type="button"
            role="menuitem"
            id={menuContext.triggerId}
            aria-haspopup="menu"
            aria-expanded={open()}
            aria-controls={open() ? menuContext.contentId : undefined}
            data-highlighted={isFocused() ? '' : undefined}
            data-state={open() ? 'open' : 'closed'}
            data-disabled={disabled() ? '' : undefined}
            disabled={disabled()}
            {...rest}
            ref={mergeRefs(local.ref, (el: HTMLElement) => {
              triggerRef = el as HTMLButtonElement;
              menuContext.onTriggerRefChange(el as HTMLButtonElement);
            })}
            onPointerDown={composeEventHandlers(local.onPointerDown as any, (event: PointerEvent) => {
              // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
              // but not when the control key is pressed (avoiding MacOS right click)
              if (!disabled() && event.button === 0 && event.ctrlKey === false) {
                context.onMenuOpen(menuContext.value);
                // prevent trigger focusing when opening
                // this allows the content to be given focus without competition
                if (!open()) event.preventDefault();
              }
            })}
            onPointerEnter={composeEventHandlers(local.onPointerEnter as any, () => {
              const menubarOpen = Boolean(context.value);
              if (menubarOpen && !open()) {
                context.onMenuOpen(menuContext.value);
                triggerRef?.focus();
              }
            })}
            onKeyDown={composeEventHandlers(local.onKeyDown as any, (event: KeyboardEvent) => {
              if (disabled()) return;
              if (['Enter', ' '].includes(event.key)) context.onMenuToggle(menuContext.value);
              if (event.key === 'ArrowDown') context.onMenuOpen(menuContext.value);
              // prevent keydown from scrolling window / first focused item to execute
              // that keydown (inadvertently closing the menu)
              if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
                menuContext.setWasKeyboardTriggerOpen(true);
                event.preventDefault();
              }
            })}
            onFocus={composeEventHandlers(local.onFocus as any, () => setIsFocused(true))}
            onBlur={composeEventHandlers(local.onBlur as any, () => setIsFocused(false))}
          />
        </MenuPrimitive.MenuAnchor>
      </RovingFocusGroupItem>
    </Collection.ItemSlot>
  );
}

MenubarTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'MenubarPortal';

interface MenubarPortalProps extends MenuPrimitive.MenuPortalProps {}

function MenubarPortal(inProps: ScopedProps<MenubarPortalProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar']);
  const menuScope = useMenuScope(local.__scopeMenubar);
  return <MenuPrimitive.MenuPortal {...menuScope} {...rest} />;
}

MenubarPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'MenubarContent';

interface MenubarContentProps extends Omit<MenuPrimitive.MenuContentProps, 'onEntryFocus'> {
  ref?: (el: HTMLElement) => void;
  style?: JSX.CSSProperties;
}

function MenubarContent(inProps: ScopedProps<MenubarContentProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeMenubar',
    'ref',
    'align',
    'style',
    'onCloseAutoFocus',
    'onFocusOutside',
    'onInteractOutside',
    'onKeyDown',
  ]);
  const menuScope = useMenuScope(local.__scopeMenubar);
  const context = useMenubarContext(CONTENT_NAME, local.__scopeMenubar);
  const menuContext = useMenubarMenuContext(CONTENT_NAME, local.__scopeMenubar);
  const getItems = useCollection(local.__scopeMenubar);
  let hasInteractedOutside = false;
  const align = () => local.align ?? 'start';

  return (
    <MenuPrimitive.MenuContent
      id={menuContext.contentId}
      aria-labelledby={menuContext.triggerId}
      data-radix-menubar-content=""
      {...menuScope}
      {...rest}
      ref={local.ref}
      align={align()}
      onCloseAutoFocus={composeEventHandlers(local.onCloseAutoFocus, (event: Event) => {
        const menubarOpen = Boolean(context.value);
        if (!menubarOpen && !hasInteractedOutside) {
          menuContext.triggerRef?.focus();
        }

        hasInteractedOutside = false;
        // Always prevent auto focus because we either focus manually or want user agent focus
        event.preventDefault();
      })}
      onFocusOutside={composeEventHandlers(local.onFocusOutside, (event: any) => {
        const target = event.target as HTMLElement;
        const isMenubarTrigger = getItems().some((item) => item.ref?.contains(target));
        if (isMenubarTrigger) event.preventDefault();
      })}
      onInteractOutside={composeEventHandlers(local.onInteractOutside, () => {
        hasInteractedOutside = true;
      })}
      onEntryFocus={(event: Event) => {
        if (!menuContext.wasKeyboardTriggerOpen) event.preventDefault();
      }}
      onKeyDown={composeEventHandlers(local.onKeyDown as any, (event: KeyboardEvent) => {
        if (['ArrowRight', 'ArrowLeft'].includes(event.key)) {
          const target = event.target as HTMLElement;
          const targetIsSubTrigger = target.hasAttribute('data-radix-menubar-subtrigger');
          const isKeyDownInsideSubMenu =
            target.closest('[data-radix-menubar-content]') !== event.currentTarget;

          const prevMenuKey = context.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
          const isPrevKey = prevMenuKey === event.key;
          const isNextKey = !isPrevKey;

          // Prevent navigation when we're opening a submenu
          if (isNextKey && targetIsSubTrigger) return;
          // or we're inside a submenu and are moving backwards to close it
          if (isKeyDownInsideSubMenu && isPrevKey) return;

          const items = getItems().filter((item) => !item.disabled);
          let candidateValues = items.map((item) => item.value);
          if (isPrevKey) candidateValues.reverse();

          const currentIndex = candidateValues.indexOf(menuContext.value);

          candidateValues = context.loop
            ? wrapArray(candidateValues, currentIndex + 1)
            : candidateValues.slice(currentIndex + 1);

          const [nextValue] = candidateValues;
          if (nextValue) context.onMenuOpen(nextValue);
        }
      })}
      style={{
        ...(local.style as JSX.CSSProperties),
        '--radix-menubar-content-transform-origin': 'var(--radix-popper-transform-origin)',
        '--radix-menubar-content-available-width': 'var(--radix-popper-available-width)',
        '--radix-menubar-content-available-height': 'var(--radix-popper-available-height)',
        '--radix-menubar-trigger-width': 'var(--radix-popper-anchor-width)',
        '--radix-menubar-trigger-height': 'var(--radix-popper-anchor-height)',
      } as JSX.CSSProperties}
    />
  );
}

MenubarContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarGroup
 * -----------------------------------------------------------------------------------------------*/

const GROUP_NAME = 'MenubarGroup';

interface MenubarGroupProps extends MenuPrimitive.MenuGroupProps {
  ref?: (el: HTMLElement) => void;
}

function MenubarGroup(inProps: ScopedProps<MenubarGroupProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar', 'ref']);
  const menuScope = useMenuScope(local.__scopeMenubar);
  return <MenuPrimitive.MenuGroup {...menuScope} {...rest} ref={local.ref} />;
}

MenubarGroup.displayName = GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarLabel
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = 'MenubarLabel';

interface MenubarLabelProps extends MenuPrimitive.MenuLabelProps {
  ref?: (el: HTMLElement) => void;
}

function MenubarLabel(inProps: ScopedProps<MenubarLabelProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar', 'ref']);
  const menuScope = useMenuScope(local.__scopeMenubar);
  return <MenuPrimitive.MenuLabel {...menuScope} {...rest} ref={local.ref} />;
}

MenubarLabel.displayName = LABEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'MenubarItem';

interface MenubarItemProps extends MenuPrimitive.MenuItemProps {
  ref?: (el: HTMLElement) => void;
}

function MenubarItem(inProps: ScopedProps<MenubarItemProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar', 'ref']);
  const menuScope = useMenuScope(local.__scopeMenubar);
  return <MenuPrimitive.MenuItem {...menuScope} {...rest} ref={local.ref} />;
}

MenubarItem.displayName = ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarCheckboxItem
 * -----------------------------------------------------------------------------------------------*/

const CHECKBOX_ITEM_NAME = 'MenubarCheckboxItem';

interface MenubarCheckboxItemProps extends MenuPrimitive.MenuCheckboxItemProps {
  ref?: (el: HTMLElement) => void;
}

function MenubarCheckboxItem(inProps: ScopedProps<MenubarCheckboxItemProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar', 'ref']);
  const menuScope = useMenuScope(local.__scopeMenubar);
  return <MenuPrimitive.MenuCheckboxItem {...menuScope} {...rest} ref={local.ref} />;
}

MenubarCheckboxItem.displayName = CHECKBOX_ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarRadioGroup
 * -----------------------------------------------------------------------------------------------*/

const RADIO_GROUP_NAME = 'MenubarRadioGroup';

interface MenubarRadioGroupProps extends MenuPrimitive.MenuRadioGroupProps {
  ref?: (el: HTMLElement) => void;
}

function MenubarRadioGroup(inProps: ScopedProps<MenubarRadioGroupProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar', 'ref']);
  const menuScope = useMenuScope(local.__scopeMenubar);
  return <MenuPrimitive.MenuRadioGroup {...menuScope} {...rest} ref={local.ref} />;
}

MenubarRadioGroup.displayName = RADIO_GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarRadioItem
 * -----------------------------------------------------------------------------------------------*/

const RADIO_ITEM_NAME = 'MenubarRadioItem';

interface MenubarRadioItemProps extends MenuPrimitive.MenuRadioItemProps {
  ref?: (el: HTMLElement) => void;
}

function MenubarRadioItem(inProps: ScopedProps<MenubarRadioItemProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar', 'ref']);
  const menuScope = useMenuScope(local.__scopeMenubar);
  return <MenuPrimitive.MenuRadioItem {...menuScope} {...rest} ref={local.ref} />;
}

MenubarRadioItem.displayName = RADIO_ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarItemIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = 'MenubarItemIndicator';

interface MenubarItemIndicatorProps extends MenuPrimitive.MenuItemIndicatorProps {
  ref?: (el: HTMLElement) => void;
}

function MenubarItemIndicator(inProps: ScopedProps<MenubarItemIndicatorProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar', 'ref']);
  const menuScope = useMenuScope(local.__scopeMenubar);
  return <MenuPrimitive.MenuItemIndicator {...menuScope} {...rest} ref={local.ref} />;
}

MenubarItemIndicator.displayName = INDICATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarSeparator
 * -----------------------------------------------------------------------------------------------*/

const SEPARATOR_NAME = 'MenubarSeparator';

interface MenubarSeparatorProps extends MenuPrimitive.MenuSeparatorProps {
  ref?: (el: HTMLElement) => void;
}

function MenubarSeparator(inProps: ScopedProps<MenubarSeparatorProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar', 'ref']);
  const menuScope = useMenuScope(local.__scopeMenubar);
  return <MenuPrimitive.MenuSeparator {...menuScope} {...rest} ref={local.ref} />;
}

MenubarSeparator.displayName = SEPARATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'MenubarArrow';

interface MenubarArrowProps extends MenuPrimitive.MenuArrowProps {
  ref?: (el: SVGSVGElement) => void;
}

function MenubarArrow(inProps: ScopedProps<MenubarArrowProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar', 'ref']);
  const menuScope = useMenuScope(local.__scopeMenubar);
  return <MenuPrimitive.MenuArrow {...menuScope} {...rest} ref={local.ref} />;
}

MenubarArrow.displayName = ARROW_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarSub
 * -----------------------------------------------------------------------------------------------*/

const SUB_NAME = 'MenubarSub';

interface MenubarSubProps {
  children?: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
}

function MenubarSub(inProps: ScopedProps<MenubarSubProps>) {
  const [local] = splitProps(inProps, [
    '__scopeMenubar',
    'children',
    'open',
    'defaultOpen',
    'onOpenChange',
  ]);
  const menuScope = useMenuScope(local.__scopeMenubar);
  const [open, setOpen] = createControllableSignal({
    prop: () => local.open,
    defaultProp: local.defaultOpen ?? false,
    onChange: local.onOpenChange,
    caller: SUB_NAME,
  });

  return (
    <MenuPrimitive.MenuSub {...menuScope} open={open()} onOpenChange={setOpen}>
      {local.children}
    </MenuPrimitive.MenuSub>
  );
}

MenubarSub.displayName = SUB_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarSubTrigger
 * -----------------------------------------------------------------------------------------------*/

const SUB_TRIGGER_NAME = 'MenubarSubTrigger';

interface MenubarSubTriggerProps extends MenuPrimitive.MenuSubTriggerProps {
  ref?: (el: HTMLElement) => void;
}

function MenubarSubTrigger(inProps: ScopedProps<MenubarSubTriggerProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar', 'ref']);
  const menuScope = useMenuScope(local.__scopeMenubar);
  return (
    <MenuPrimitive.MenuSubTrigger
      data-radix-menubar-subtrigger=""
      {...menuScope}
      {...rest}
      ref={local.ref}
    />
  );
}

MenubarSubTrigger.displayName = SUB_TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenubarSubContent
 * -----------------------------------------------------------------------------------------------*/

const SUB_CONTENT_NAME = 'MenubarSubContent';

interface MenubarSubContentProps extends MenuPrimitive.MenuSubContentProps {
  ref?: (el: HTMLElement) => void;
  style?: JSX.CSSProperties;
}

function MenubarSubContent(inProps: ScopedProps<MenubarSubContentProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeMenubar', 'ref', 'style']);
  const menuScope = useMenuScope(local.__scopeMenubar);

  return (
    <MenuPrimitive.MenuSubContent
      {...menuScope}
      data-radix-menubar-content=""
      {...rest}
      ref={local.ref}
      style={{
        ...(local.style as JSX.CSSProperties),
        '--radix-menubar-content-transform-origin': 'var(--radix-popper-transform-origin)',
        '--radix-menubar-content-available-width': 'var(--radix-popper-available-width)',
        '--radix-menubar-content-available-height': 'var(--radix-popper-available-height)',
        '--radix-menubar-trigger-width': 'var(--radix-popper-anchor-width)',
        '--radix-menubar-trigger-height': 'var(--radix-popper-anchor-height)',
      } as JSX.CSSProperties}
    />
  );
}

MenubarSubContent.displayName = SUB_CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------------------------*/

/**
 * Wraps an array around itself at a given start index
 * Example: `wrapArray(['a', 'b', 'c', 'd'], 2) === ['c', 'd', 'a', 'b']`
 */
function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>((_, index) => array[(startIndex + index) % array.length]!);
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = Menubar;
const Menu = MenubarMenu;
const Trigger = MenubarTrigger;
const Portal = MenubarPortal;
const Content = MenubarContent;
const Group = MenubarGroup;
const Label = MenubarLabel;
const Item = MenubarItem;
const CheckboxItem = MenubarCheckboxItem;
const RadioGroup = MenubarRadioGroup;
const RadioItem = MenubarRadioItem;
const ItemIndicator = MenubarItemIndicator;
const Separator = MenubarSeparator;
const Arrow = MenubarArrow;
const Sub = MenubarSub;
const SubTrigger = MenubarSubTrigger;
const SubContent = MenubarSubContent;

export {
  createMenubarScope,
  //
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarPortal,
  MenubarContent,
  MenubarGroup,
  MenubarLabel,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarItemIndicator,
  MenubarSeparator,
  MenubarArrow,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  //
  Root,
  Menu,
  Trigger,
  Portal,
  Content,
  Group,
  Label,
  Item,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  ItemIndicator,
  Separator,
  Arrow,
  Sub,
  SubTrigger,
  SubContent,
};
export type {
  MenubarProps,
  MenubarMenuProps,
  MenubarTriggerProps,
  MenubarPortalProps,
  MenubarContentProps,
  MenubarGroupProps,
  MenubarLabelProps,
  MenubarItemProps,
  MenubarCheckboxItemProps,
  MenubarRadioGroupProps,
  MenubarRadioItemProps,
  MenubarItemIndicatorProps,
  MenubarSeparatorProps,
  MenubarArrowProps,
  MenubarSubProps,
  MenubarSubTriggerProps,
  MenubarSubContentProps,
};
