import { type JSX, splitProps, createSignal } from 'solid-js';
import { createContextScope, type Scope } from '@radix-solid-js/context';
import { mergeRefs } from '@radix-solid-js/compose-refs';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { Primitive } from '@radix-solid-js/primitive-component';
import { createControllableSignal } from '@radix-solid-js/use-controllable-state';
import { createId } from '@radix-solid-js/id';
import * as MenuPrimitive from '@radix-solid-js/menu';
import { createMenuScope } from '@radix-solid-js/menu';

import type { Direction } from '@radix-solid-js/direction';

/* -------------------------------------------------------------------------------------------------
 * DropdownMenu
 * -----------------------------------------------------------------------------------------------*/

const DROPDOWN_MENU_NAME = 'DropdownMenu';

type ScopedProps<P> = P & { __scopeDropdownMenu?: Scope };
const [createDropdownMenuContext, createDropdownMenuScope] = createContextScope(
  DROPDOWN_MENU_NAME,
  [createMenuScope],
);
const useMenuScope = createMenuScope();

type DropdownMenuContextValue = {
  triggerId: string;
  triggerRef: HTMLButtonElement | undefined;
  onTriggerRefChange: (el: HTMLButtonElement | undefined) => void;
  contentId: string;
  open: boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
  modal: boolean;
};

const [DropdownMenuProvider, useDropdownMenuContext] =
  createDropdownMenuContext<DropdownMenuContextValue>(DROPDOWN_MENU_NAME);

interface DropdownMenuProps {
  children?: JSX.Element;
  dir?: Direction;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  modal?: boolean;
}

function DropdownMenu(inProps: ScopedProps<DropdownMenuProps>) {
  const [local] = splitProps(inProps, [
    '__scopeDropdownMenu',
    'children',
    'dir',
    'open',
    'defaultOpen',
    'onOpenChange',
    'modal',
  ]);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement | undefined>(undefined);
  const [open, setOpen] = createControllableSignal({
    prop: () => local.open,
    defaultProp: local.defaultOpen ?? false,
    onChange: local.onOpenChange,
    caller: DROPDOWN_MENU_NAME,
  });
  const modal = () => local.modal ?? true;

  return (
    <DropdownMenuProvider
      scope={local.__scopeDropdownMenu}
      triggerId={createId()}
      triggerRef={triggerRef()}
      onTriggerRefChange={setTriggerRef}
      contentId={createId()}
      open={open()}
      onOpenChange={setOpen}
      onOpenToggle={() => setOpen((prevOpen) => !prevOpen)}
      modal={modal()}
    >
      <MenuPrimitive.Menu
        {...menuScope}
        open={open()}
        onOpenChange={setOpen}
        dir={local.dir}
        modal={modal()}
      >
        {local.children}
      </MenuPrimitive.Menu>
    </DropdownMenuProvider>
  );
}

DropdownMenu.displayName = DROPDOWN_MENU_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'DropdownMenuTrigger';

interface DropdownMenuTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function DropdownMenuTrigger(inProps: ScopedProps<DropdownMenuTriggerProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeDropdownMenu',
    'ref',
    'disabled',
    'onPointerDown',
    'onKeyDown',
  ]);
  const context = useDropdownMenuContext(TRIGGER_NAME, local.__scopeDropdownMenu);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  const disabled = () => local.disabled ?? false;

  return (
    <MenuPrimitive.MenuAnchor {...menuScope}>
      <Primitive.button
        type="button"
        id={context.triggerId}
        aria-haspopup="menu"
        aria-expanded={context.open}
        aria-controls={context.open ? context.contentId : undefined}
        data-state={context.open ? 'open' : 'closed'}
        data-disabled={disabled() ? '' : undefined}
        disabled={disabled()}
        {...rest}
        ref={mergeRefs(local.ref, (el: HTMLElement) => context.onTriggerRefChange(el as HTMLButtonElement))}
        onPointerDown={composeEventHandlers(local.onPointerDown as any, (event: PointerEvent) => {
          // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
          // but not when the control key is pressed (avoiding MacOS right click)
          if (!disabled() && event.button === 0 && event.ctrlKey === false) {
            context.onOpenToggle();
            // prevent trigger focusing when opening
            // this allows the content to be given focus without competition
            if (!context.open) event.preventDefault();
          }
        })}
        onKeyDown={composeEventHandlers(local.onKeyDown as any, (event: KeyboardEvent) => {
          if (disabled()) return;
          if (['Enter', ' '].includes(event.key)) context.onOpenToggle();
          if (event.key === 'ArrowDown') context.onOpenChange(true);
          // prevent keydown from scrolling window / first focused item to execute
          // that keydown (inadvertently closing the menu)
          if (['Enter', ' ', 'ArrowDown'].includes(event.key)) event.preventDefault();
        })}
      />
    </MenuPrimitive.MenuAnchor>
  );
}

DropdownMenuTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'DropdownMenuPortal';

interface DropdownMenuPortalProps extends MenuPrimitive.MenuPortalProps {}

function DropdownMenuPortal(inProps: ScopedProps<DropdownMenuPortalProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  return <MenuPrimitive.MenuPortal {...menuScope} {...rest} />;
}

DropdownMenuPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'DropdownMenuContent';

interface DropdownMenuContentProps extends Omit<MenuPrimitive.MenuContentProps, 'onEntryFocus'> {
  ref?: (el: HTMLElement) => void;
}

function DropdownMenuContent(inProps: ScopedProps<DropdownMenuContentProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeDropdownMenu',
    'ref',
    'style',
    'onCloseAutoFocus',
    'onInteractOutside',
  ]);
  const context = useDropdownMenuContext(CONTENT_NAME, local.__scopeDropdownMenu);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  let hasInteractedOutside = false;

  return (
    <MenuPrimitive.MenuContent
      id={context.contentId}
      aria-labelledby={context.triggerId}
      {...menuScope}
      {...rest}
      ref={local.ref}
      onCloseAutoFocus={composeEventHandlers(local.onCloseAutoFocus, (event: Event) => {
        if (!hasInteractedOutside) context.triggerRef?.focus();
        hasInteractedOutside = false;
        // Always prevent auto focus because we either focus manually or want user agent focus
        event.preventDefault();
      })}
      onInteractOutside={composeEventHandlers(local.onInteractOutside, (event: any) => {
        const originalEvent = event.detail.originalEvent as PointerEvent;
        const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
        const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
        if (!context.modal || isRightClick) hasInteractedOutside = true;
      })}
      style={{
        ...(local.style as JSX.CSSProperties),
        '--radix-dropdown-menu-content-transform-origin': 'var(--radix-popper-transform-origin)',
        '--radix-dropdown-menu-content-available-width': 'var(--radix-popper-available-width)',
        '--radix-dropdown-menu-content-available-height': 'var(--radix-popper-available-height)',
        '--radix-dropdown-menu-trigger-width': 'var(--radix-popper-anchor-width)',
        '--radix-dropdown-menu-trigger-height': 'var(--radix-popper-anchor-height)',
      }}
    />
  );
}

DropdownMenuContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuGroup
 * -----------------------------------------------------------------------------------------------*/

const GROUP_NAME = 'DropdownMenuGroup';

interface DropdownMenuGroupProps extends MenuPrimitive.MenuGroupProps {
  ref?: (el: HTMLElement) => void;
}

function DropdownMenuGroup(inProps: ScopedProps<DropdownMenuGroupProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  return <MenuPrimitive.MenuGroup {...menuScope} {...rest} ref={local.ref} />;
}

DropdownMenuGroup.displayName = GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuLabel
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = 'DropdownMenuLabel';

interface DropdownMenuLabelProps extends MenuPrimitive.MenuLabelProps {
  ref?: (el: HTMLElement) => void;
}

function DropdownMenuLabel(inProps: ScopedProps<DropdownMenuLabelProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  return <MenuPrimitive.MenuLabel {...menuScope} {...rest} ref={local.ref} />;
}

DropdownMenuLabel.displayName = LABEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'DropdownMenuItem';

interface DropdownMenuItemProps extends MenuPrimitive.MenuItemProps {
  ref?: (el: HTMLElement) => void;
}

function DropdownMenuItem(inProps: ScopedProps<DropdownMenuItemProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  return <MenuPrimitive.MenuItem {...menuScope} {...rest} ref={local.ref} />;
}

DropdownMenuItem.displayName = ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuCheckboxItem
 * -----------------------------------------------------------------------------------------------*/

const CHECKBOX_ITEM_NAME = 'DropdownMenuCheckboxItem';

interface DropdownMenuCheckboxItemProps extends MenuPrimitive.MenuCheckboxItemProps {
  ref?: (el: HTMLElement) => void;
}

function DropdownMenuCheckboxItem(inProps: ScopedProps<DropdownMenuCheckboxItemProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  return <MenuPrimitive.MenuCheckboxItem {...menuScope} {...rest} ref={local.ref} />;
}

DropdownMenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuRadioGroup
 * -----------------------------------------------------------------------------------------------*/

const RADIO_GROUP_NAME = 'DropdownMenuRadioGroup';

interface DropdownMenuRadioGroupProps extends MenuPrimitive.MenuRadioGroupProps {
  ref?: (el: HTMLElement) => void;
}

function DropdownMenuRadioGroup(inProps: ScopedProps<DropdownMenuRadioGroupProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  return <MenuPrimitive.MenuRadioGroup {...menuScope} {...rest} ref={local.ref} />;
}

DropdownMenuRadioGroup.displayName = RADIO_GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuRadioItem
 * -----------------------------------------------------------------------------------------------*/

const RADIO_ITEM_NAME = 'DropdownMenuRadioItem';

interface DropdownMenuRadioItemProps extends MenuPrimitive.MenuRadioItemProps {
  ref?: (el: HTMLElement) => void;
}

function DropdownMenuRadioItem(inProps: ScopedProps<DropdownMenuRadioItemProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  return <MenuPrimitive.MenuRadioItem {...menuScope} {...rest} ref={local.ref} />;
}

DropdownMenuRadioItem.displayName = RADIO_ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuItemIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = 'DropdownMenuItemIndicator';

interface DropdownMenuItemIndicatorProps extends MenuPrimitive.MenuItemIndicatorProps {
  ref?: (el: HTMLElement) => void;
}

function DropdownMenuItemIndicator(inProps: ScopedProps<DropdownMenuItemIndicatorProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  return <MenuPrimitive.MenuItemIndicator {...menuScope} {...rest} ref={local.ref} />;
}

DropdownMenuItemIndicator.displayName = INDICATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSeparator
 * -----------------------------------------------------------------------------------------------*/

const SEPARATOR_NAME = 'DropdownMenuSeparator';

interface DropdownMenuSeparatorProps extends MenuPrimitive.MenuSeparatorProps {
  ref?: (el: HTMLElement) => void;
}

function DropdownMenuSeparator(inProps: ScopedProps<DropdownMenuSeparatorProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  return <MenuPrimitive.MenuSeparator {...menuScope} {...rest} ref={local.ref} />;
}

DropdownMenuSeparator.displayName = SEPARATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'DropdownMenuArrow';

interface DropdownMenuArrowProps extends MenuPrimitive.MenuArrowProps {
  ref?: (el: SVGSVGElement) => void;
}

function DropdownMenuArrow(inProps: ScopedProps<DropdownMenuArrowProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  return <MenuPrimitive.MenuArrow {...menuScope} {...rest} ref={local.ref} />;
}

DropdownMenuArrow.displayName = ARROW_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSub
 * -----------------------------------------------------------------------------------------------*/

interface DropdownMenuSubProps {
  children?: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
}

function DropdownMenuSub(inProps: ScopedProps<DropdownMenuSubProps>) {
  const [local] = splitProps(inProps, [
    '__scopeDropdownMenu',
    'children',
    'open',
    'defaultOpen',
    'onOpenChange',
  ]);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  const [open, setOpen] = createControllableSignal({
    prop: () => local.open,
    defaultProp: local.defaultOpen ?? false,
    onChange: local.onOpenChange,
    caller: 'DropdownMenuSub',
  });

  return (
    <MenuPrimitive.MenuSub {...menuScope} open={open()} onOpenChange={setOpen}>
      {local.children}
    </MenuPrimitive.MenuSub>
  );
}

DropdownMenuSub.displayName = 'DropdownMenuSub';

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSubTrigger
 * -----------------------------------------------------------------------------------------------*/

const SUB_TRIGGER_NAME = 'DropdownMenuSubTrigger';

interface DropdownMenuSubTriggerProps extends MenuPrimitive.MenuSubTriggerProps {
  ref?: (el: HTMLElement) => void;
}

function DropdownMenuSubTrigger(inProps: ScopedProps<DropdownMenuSubTriggerProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);
  return <MenuPrimitive.MenuSubTrigger {...menuScope} {...rest} ref={local.ref} />;
}

DropdownMenuSubTrigger.displayName = SUB_TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSubContent
 * -----------------------------------------------------------------------------------------------*/

const SUB_CONTENT_NAME = 'DropdownMenuSubContent';

interface DropdownMenuSubContentProps extends MenuPrimitive.MenuSubContentProps {
  ref?: (el: HTMLElement) => void;
  style?: JSX.CSSProperties;
}

function DropdownMenuSubContent(inProps: ScopedProps<DropdownMenuSubContentProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeDropdownMenu', 'ref', 'style']);
  const menuScope = useMenuScope(local.__scopeDropdownMenu);

  return (
    <MenuPrimitive.MenuSubContent
      {...menuScope}
      {...rest}
      ref={local.ref}
      style={{
        ...(local.style as JSX.CSSProperties),
        '--radix-dropdown-menu-content-transform-origin': 'var(--radix-popper-transform-origin)',
        '--radix-dropdown-menu-content-available-width': 'var(--radix-popper-available-width)',
        '--radix-dropdown-menu-content-available-height': 'var(--radix-popper-available-height)',
        '--radix-dropdown-menu-trigger-width': 'var(--radix-popper-anchor-width)',
        '--radix-dropdown-menu-trigger-height': 'var(--radix-popper-anchor-height)',
      } as JSX.CSSProperties}
    />
  );
}

DropdownMenuSubContent.displayName = SUB_CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = DropdownMenu;
const Trigger = DropdownMenuTrigger;
const Portal = DropdownMenuPortal;
const Content = DropdownMenuContent;
const Group = DropdownMenuGroup;
const Label = DropdownMenuLabel;
const Item = DropdownMenuItem;
const CheckboxItem = DropdownMenuCheckboxItem;
const RadioGroup = DropdownMenuRadioGroup;
const RadioItem = DropdownMenuRadioItem;
const ItemIndicator = DropdownMenuItemIndicator;
const Separator = DropdownMenuSeparator;
const Arrow = DropdownMenuArrow;
const Sub = DropdownMenuSub;
const SubTrigger = DropdownMenuSubTrigger;
const SubContent = DropdownMenuSubContent;

export {
  createDropdownMenuScope,
  //
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuArrow,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  //
  Root,
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
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuPortalProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuLabelProps,
  DropdownMenuItemProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuItemIndicatorProps,
  DropdownMenuSeparatorProps,
  DropdownMenuArrowProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuSubContentProps,
};
