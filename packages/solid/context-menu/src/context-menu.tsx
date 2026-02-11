import { type JSX, splitProps, createSignal, createEffect, onCleanup } from 'solid-js';
import { isServer } from 'solid-js/web';
import { createContextScope, type Scope } from '@radix-solid-js/context';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { Primitive } from '@radix-solid-js/primitive-component';
import { createControllableSignal } from '@radix-solid-js/use-controllable-state';
import * as MenuPrimitive from '@radix-solid-js/menu';
import { createMenuScope } from '@radix-solid-js/menu';

import type { Direction } from '@radix-solid-js/direction';

type Point = { x: number; y: number };

/* -------------------------------------------------------------------------------------------------
 * ContextMenu
 * -----------------------------------------------------------------------------------------------*/

const CONTEXT_MENU_NAME = 'ContextMenu';

type ScopedProps<P> = P & { __scopeContextMenu?: Scope };
const [createContextMenuContext, createContextMenuScope] = createContextScope(CONTEXT_MENU_NAME, [
  createMenuScope,
]);
const useMenuScope = createMenuScope();

type ContextMenuContextValue = {
  open: boolean;
  onOpenChange(open: boolean): void;
  modal: boolean;
};

const [ContextMenuProvider, useContextMenuContext] =
  createContextMenuContext<ContextMenuContextValue>(CONTEXT_MENU_NAME);

interface ContextMenuProps {
  children?: JSX.Element;
  onOpenChange?(open: boolean): void;
  dir?: Direction;
  modal?: boolean;
}

function ContextMenu(inProps: ScopedProps<ContextMenuProps>) {
  const [local] = splitProps(inProps, [
    '__scopeContextMenu',
    'children',
    'onOpenChange',
    'dir',
    'modal',
  ]);
  const [open, setOpen] = createSignal(false);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  const modal = () => local.modal ?? true;

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    local.onOpenChange?.(value);
  };

  return (
    <ContextMenuProvider
      scope={local.__scopeContextMenu}
      open={open()}
      onOpenChange={handleOpenChange}
      modal={modal()}
    >
      <MenuPrimitive.Menu
        {...menuScope}
        dir={local.dir}
        open={open()}
        onOpenChange={handleOpenChange}
        modal={modal()}
      >
        {local.children}
      </MenuPrimitive.Menu>
    </ContextMenuProvider>
  );
}

ContextMenu.displayName = CONTEXT_MENU_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'ContextMenuTrigger';

interface ContextMenuTriggerProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  disabled?: boolean;
  ref?: (el: HTMLElement) => void;
}

function ContextMenuTrigger(inProps: ScopedProps<ContextMenuTriggerProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeContextMenu',
    'ref',
    'disabled',
    'style',
    'onContextMenu',
    'onPointerDown',
    'onPointerMove',
    'onPointerCancel',
    'onPointerUp',
  ]);
  const context = useContextMenuContext(TRIGGER_NAME, local.__scopeContextMenu);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  const disabled = () => local.disabled ?? false;

  let pointRef: Point = { x: 0, y: 0 };
  const makeRect = () => ({
    x: pointRef.x, y: pointRef.y,
    width: 0, height: 0,
    top: pointRef.y, right: pointRef.x, bottom: pointRef.y, left: pointRef.x,
    toJSON() {},
  } as DOMRect);
  const [virtualRef, setVirtualRef] = createSignal({
    getBoundingClientRect: makeRect,
  });
  let longPressTimer = 0;
  const clearLongPress = () => {
    if (!isServer) window.clearTimeout(longPressTimer);
  };

  const handleOpen = (event: MouseEvent | PointerEvent) => {
    pointRef = { x: event.clientX, y: event.clientY };
    // Update virtualRef signal to trigger reactivity in PopperAnchor
    setVirtualRef({ getBoundingClientRect: makeRect });
    context.onOpenChange(true);
  };

  onCleanup(clearLongPress);

  createEffect(() => {
    if (disabled()) clearLongPress();
  });

  return (
    <>
      <MenuPrimitive.MenuAnchor {...menuScope} virtualRef={virtualRef()} />
      <Primitive.span
        data-state={context.open ? 'open' : 'closed'}
        data-disabled={disabled() ? '' : undefined}
        {...rest}
        ref={local.ref}
        // prevent iOS context menu from appearing
        style={{ 'user-select': 'none', '-webkit-touch-callout': 'none', ...(local.style as JSX.CSSProperties) }}
        // if trigger is disabled, enable the native Context Menu
        onContextMenu={
          disabled()
            ? local.onContextMenu
            : composeEventHandlers(local.onContextMenu as any, (event: MouseEvent) => {
                // clearing the long press here because some platforms already support
                // long press to trigger a `contextmenu` event
                clearLongPress();
                handleOpen(event);
                event.preventDefault();
              })
        }
        onPointerDown={
          disabled()
            ? local.onPointerDown
            : composeEventHandlers(
                local.onPointerDown as any,
                whenTouchOrPen((event: PointerEvent) => {
                  // clear the long press here in case there's multiple touch points
                  clearLongPress();
                  longPressTimer = window.setTimeout(() => handleOpen(event), 700);
                }),
              )
        }
        onPointerMove={
          disabled()
            ? local.onPointerMove
            : composeEventHandlers(local.onPointerMove as any, whenTouchOrPen(clearLongPress))
        }
        onPointerCancel={
          disabled()
            ? local.onPointerCancel
            : composeEventHandlers(local.onPointerCancel as any, whenTouchOrPen(clearLongPress))
        }
        onPointerUp={
          disabled()
            ? local.onPointerUp
            : composeEventHandlers(local.onPointerUp as any, whenTouchOrPen(clearLongPress))
        }
      />
    </>
  );
}

ContextMenuTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'ContextMenuPortal';

interface ContextMenuPortalProps extends MenuPrimitive.MenuPortalProps {}

function ContextMenuPortal(inProps: ScopedProps<ContextMenuPortalProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu']);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  return <MenuPrimitive.MenuPortal {...menuScope} {...rest} />;
}

ContextMenuPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'ContextMenuContent';

interface ContextMenuContentProps
  extends Omit<MenuPrimitive.MenuContentProps, 'onEntryFocus' | 'side' | 'sideOffset' | 'align'> {
  ref?: (el: HTMLElement) => void;
}

function ContextMenuContent(inProps: ScopedProps<ContextMenuContentProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeContextMenu',
    'ref',
    'style',
    'onCloseAutoFocus',
    'onInteractOutside',
  ]);
  const context = useContextMenuContext(CONTENT_NAME, local.__scopeContextMenu);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  let hasInteractedOutside = false;

  return (
    <MenuPrimitive.MenuContent
      {...menuScope}
      {...rest}
      ref={local.ref}
      side="right"
      sideOffset={2}
      align="start"
      onCloseAutoFocus={(event: Event) => {
        (local.onCloseAutoFocus as any)?.(event);

        if (!event.defaultPrevented && hasInteractedOutside) {
          event.preventDefault();
        }

        hasInteractedOutside = false;
      }}
      onInteractOutside={(event: any) => {
        (local.onInteractOutside as any)?.(event);

        if (!event.defaultPrevented && !context.modal) hasInteractedOutside = true;
      }}
      style={{
        ...(local.style as JSX.CSSProperties),
        '--radix-context-menu-content-transform-origin': 'var(--radix-popper-transform-origin)',
        '--radix-context-menu-content-available-width': 'var(--radix-popper-available-width)',
        '--radix-context-menu-content-available-height': 'var(--radix-popper-available-height)',
        '--radix-context-menu-trigger-width': 'var(--radix-popper-anchor-width)',
        '--radix-context-menu-trigger-height': 'var(--radix-popper-anchor-height)',
      }}
    />
  );
}

ContextMenuContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuGroup
 * -----------------------------------------------------------------------------------------------*/

const GROUP_NAME = 'ContextMenuGroup';

interface ContextMenuGroupProps extends MenuPrimitive.MenuGroupProps {
  ref?: (el: HTMLElement) => void;
}

function ContextMenuGroup(inProps: ScopedProps<ContextMenuGroupProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  return <MenuPrimitive.MenuGroup {...menuScope} {...rest} ref={local.ref} />;
}

ContextMenuGroup.displayName = GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuLabel
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = 'ContextMenuLabel';

interface ContextMenuLabelProps extends MenuPrimitive.MenuLabelProps {
  ref?: (el: HTMLElement) => void;
}

function ContextMenuLabel(inProps: ScopedProps<ContextMenuLabelProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  return <MenuPrimitive.MenuLabel {...menuScope} {...rest} ref={local.ref} />;
}

ContextMenuLabel.displayName = LABEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'ContextMenuItem';

interface ContextMenuItemProps extends MenuPrimitive.MenuItemProps {
  ref?: (el: HTMLElement) => void;
}

function ContextMenuItem(inProps: ScopedProps<ContextMenuItemProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  return <MenuPrimitive.MenuItem {...menuScope} {...rest} ref={local.ref} />;
}

ContextMenuItem.displayName = ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuCheckboxItem
 * -----------------------------------------------------------------------------------------------*/

const CHECKBOX_ITEM_NAME = 'ContextMenuCheckboxItem';

interface ContextMenuCheckboxItemProps extends MenuPrimitive.MenuCheckboxItemProps {
  ref?: (el: HTMLElement) => void;
}

function ContextMenuCheckboxItem(inProps: ScopedProps<ContextMenuCheckboxItemProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  return <MenuPrimitive.MenuCheckboxItem {...menuScope} {...rest} ref={local.ref} />;
}

ContextMenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuRadioGroup
 * -----------------------------------------------------------------------------------------------*/

const RADIO_GROUP_NAME = 'ContextMenuRadioGroup';

interface ContextMenuRadioGroupProps extends MenuPrimitive.MenuRadioGroupProps {
  ref?: (el: HTMLElement) => void;
}

function ContextMenuRadioGroup(inProps: ScopedProps<ContextMenuRadioGroupProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  return <MenuPrimitive.MenuRadioGroup {...menuScope} {...rest} ref={local.ref} />;
}

ContextMenuRadioGroup.displayName = RADIO_GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuRadioItem
 * -----------------------------------------------------------------------------------------------*/

const RADIO_ITEM_NAME = 'ContextMenuRadioItem';

interface ContextMenuRadioItemProps extends MenuPrimitive.MenuRadioItemProps {
  ref?: (el: HTMLElement) => void;
}

function ContextMenuRadioItem(inProps: ScopedProps<ContextMenuRadioItemProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  return <MenuPrimitive.MenuRadioItem {...menuScope} {...rest} ref={local.ref} />;
}

ContextMenuRadioItem.displayName = RADIO_ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuItemIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = 'ContextMenuItemIndicator';

interface ContextMenuItemIndicatorProps extends MenuPrimitive.MenuItemIndicatorProps {
  ref?: (el: HTMLElement) => void;
}

function ContextMenuItemIndicator(inProps: ScopedProps<ContextMenuItemIndicatorProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  return <MenuPrimitive.MenuItemIndicator {...menuScope} {...rest} ref={local.ref} />;
}

ContextMenuItemIndicator.displayName = INDICATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuSeparator
 * -----------------------------------------------------------------------------------------------*/

const SEPARATOR_NAME = 'ContextMenuSeparator';

interface ContextMenuSeparatorProps extends MenuPrimitive.MenuSeparatorProps {
  ref?: (el: HTMLElement) => void;
}

function ContextMenuSeparator(inProps: ScopedProps<ContextMenuSeparatorProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  return <MenuPrimitive.MenuSeparator {...menuScope} {...rest} ref={local.ref} />;
}

ContextMenuSeparator.displayName = SEPARATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'ContextMenuArrow';

interface ContextMenuArrowProps extends MenuPrimitive.MenuArrowProps {
  ref?: (el: SVGSVGElement) => void;
}

function ContextMenuArrow(inProps: ScopedProps<ContextMenuArrowProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  return <MenuPrimitive.MenuArrow {...menuScope} {...rest} ref={local.ref} />;
}

ContextMenuArrow.displayName = ARROW_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuSub
 * -----------------------------------------------------------------------------------------------*/

const SUB_NAME = 'ContextMenuSub';

interface ContextMenuSubProps {
  children?: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
}

function ContextMenuSub(inProps: ScopedProps<ContextMenuSubProps>) {
  const [local] = splitProps(inProps, [
    '__scopeContextMenu',
    'children',
    'open',
    'defaultOpen',
    'onOpenChange',
  ]);
  const menuScope = useMenuScope(local.__scopeContextMenu);
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

ContextMenuSub.displayName = SUB_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuSubTrigger
 * -----------------------------------------------------------------------------------------------*/

const SUB_TRIGGER_NAME = 'ContextMenuSubTrigger';

interface ContextMenuSubTriggerProps extends MenuPrimitive.MenuSubTriggerProps {
  ref?: (el: HTMLElement) => void;
}

function ContextMenuSubTrigger(inProps: ScopedProps<ContextMenuSubTriggerProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu', 'ref']);
  const menuScope = useMenuScope(local.__scopeContextMenu);
  return <MenuPrimitive.MenuSubTrigger {...menuScope} {...rest} ref={local.ref} />;
}

ContextMenuSubTrigger.displayName = SUB_TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuSubContent
 * -----------------------------------------------------------------------------------------------*/

const SUB_CONTENT_NAME = 'ContextMenuSubContent';

interface ContextMenuSubContentProps extends MenuPrimitive.MenuSubContentProps {
  ref?: (el: HTMLElement) => void;
  style?: JSX.CSSProperties;
}

function ContextMenuSubContent(inProps: ScopedProps<ContextMenuSubContentProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeContextMenu', 'ref', 'style']);
  const menuScope = useMenuScope(local.__scopeContextMenu);

  return (
    <MenuPrimitive.MenuSubContent
      {...menuScope}
      {...rest}
      ref={local.ref}
      style={{
        ...(local.style as JSX.CSSProperties),
        '--radix-context-menu-content-transform-origin': 'var(--radix-popper-transform-origin)',
        '--radix-context-menu-content-available-width': 'var(--radix-popper-available-width)',
        '--radix-context-menu-content-available-height': 'var(--radix-popper-available-height)',
        '--radix-context-menu-trigger-width': 'var(--radix-popper-anchor-width)',
        '--radix-context-menu-trigger-height': 'var(--radix-popper-anchor-height)',
      } as JSX.CSSProperties}
    />
  );
}

ContextMenuSubContent.displayName = SUB_CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------------------------*/

function whenTouchOrPen<E extends PointerEvent>(handler: (event: E) => void): (event: E) => void {
  return (event: E) => {
    if (event.pointerType !== 'mouse') handler(event);
  };
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = ContextMenu;
const Trigger = ContextMenuTrigger;
const Portal = ContextMenuPortal;
const Content = ContextMenuContent;
const Group = ContextMenuGroup;
const Label = ContextMenuLabel;
const Item = ContextMenuItem;
const CheckboxItem = ContextMenuCheckboxItem;
const RadioGroup = ContextMenuRadioGroup;
const RadioItem = ContextMenuRadioItem;
const ItemIndicator = ContextMenuItemIndicator;
const Separator = ContextMenuSeparator;
const Arrow = ContextMenuArrow;
const Sub = ContextMenuSub;
const SubTrigger = ContextMenuSubTrigger;
const SubContent = ContextMenuSubContent;

export {
  createContextMenuScope,
  //
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuItemIndicator,
  ContextMenuSeparator,
  ContextMenuArrow,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
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
  ContextMenuProps,
  ContextMenuTriggerProps,
  ContextMenuPortalProps,
  ContextMenuContentProps,
  ContextMenuGroupProps,
  ContextMenuLabelProps,
  ContextMenuItemProps,
  ContextMenuCheckboxItemProps,
  ContextMenuRadioGroupProps,
  ContextMenuRadioItemProps,
  ContextMenuItemIndicatorProps,
  ContextMenuSeparatorProps,
  ContextMenuArrowProps,
  ContextMenuSubProps,
  ContextMenuSubTriggerProps,
  ContextMenuSubContentProps,
};
