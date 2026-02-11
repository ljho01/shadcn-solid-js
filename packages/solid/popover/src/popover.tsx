import {
  type JSX,
  createSignal,
  createEffect,
  onCleanup,
  splitProps,
  Show,
} from 'solid-js';
import { composeEventHandlers } from '@radix-solid/primitive';
import { mergeRefs } from '@radix-solid/compose-refs';
import { createContextScope, type Scope } from '@radix-solid/context';
import { DismissableLayer } from '@radix-solid/dismissable-layer';
import { useFocusGuards } from '@radix-solid/focus-guards';
import { FocusScope } from '@radix-solid/focus-scope';
import { createId } from '@radix-solid/id';
import {
  createPopperScope,
  Popper,
  PopperAnchor,
  PopperContent,
  PopperArrow,
} from '@radix-solid/popper';
import { Portal as PortalPrimitive } from '@radix-solid/portal';
import { Presence } from '@radix-solid/presence';
import { Primitive } from '@radix-solid/primitive-component';
import { createControllableSignal } from '@radix-solid/use-controllable-state';
import { hideOthers } from 'aria-hidden';

/* -------------------------------------------------------------------------------------------------
 * Popover
 * -----------------------------------------------------------------------------------------------*/

const POPOVER_NAME = 'Popover';

type ScopedProps<P> = P & { __scopePopover?: Scope };
const [createPopoverContext, createPopoverScope] = createContextScope(POPOVER_NAME, [
  createPopperScope,
]);
const usePopperScope = createPopperScope();

type PopoverContextValue = {
  triggerRef: HTMLButtonElement | null;
  onTriggerRefChange: (el: HTMLButtonElement | null) => void;
  contentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenToggle: () => void;
  hasCustomAnchor: boolean;
  onCustomAnchorAdd: () => void;
  onCustomAnchorRemove: () => void;
  modal: boolean;
};

const [PopoverProvider, usePopoverContext] =
  createPopoverContext<PopoverContextValue>(POPOVER_NAME);

interface PopoverProps {
  children?: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

function Popover(props: ScopedProps<PopoverProps>) {
  const [local] = splitProps(props, [
    '__scopePopover',
    'children',
    'open',
    'defaultOpen',
    'onOpenChange',
    'modal',
  ]);

  const popperScope = usePopperScope(local.__scopePopover);
  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement | null>(null);
  const [hasCustomAnchor, setHasCustomAnchor] = createSignal(false);
  const contentId = createId();

  const [open, setOpen] = createControllableSignal({
    prop: () => local.open,
    defaultProp: local.defaultOpen ?? false,
    onChange: (value) => local.onOpenChange?.(value),
  });

  const modal = () => local.modal ?? false;

  return (
    <Popper {...popperScope}>
      <PopoverProvider
        scope={local.__scopePopover}
        contentId={contentId}
        triggerRef={triggerRef()}
        onTriggerRefChange={setTriggerRef}
        open={open()}
        onOpenChange={setOpen}
        onOpenToggle={() => setOpen((prev) => !prev)}
        hasCustomAnchor={hasCustomAnchor()}
        onCustomAnchorAdd={() => setHasCustomAnchor(true)}
        onCustomAnchorRemove={() => setHasCustomAnchor(false)}
        modal={modal()}
      >
        {local.children}
      </PopoverProvider>
    </Popper>
  );
}

Popover.displayName = POPOVER_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopoverAnchor
 * -----------------------------------------------------------------------------------------------*/

const ANCHOR_NAME = 'PopoverAnchor';

interface PopoverAnchorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
}

function PopoverAnchor(inProps: ScopedProps<PopoverAnchorProps>) {
  const [local, rest] = splitProps(inProps, ['__scopePopover', 'ref']);
  const context = usePopoverContext(ANCHOR_NAME, local.__scopePopover);
  const popperScope = usePopperScope(local.__scopePopover);

  // Notify the root that a custom anchor has been added
  createEffect(() => {
    context.onCustomAnchorAdd();
    onCleanup(() => context.onCustomAnchorRemove());
  });

  return <PopperAnchor {...popperScope} {...rest} ref={local.ref} />;
}

PopoverAnchor.displayName = ANCHOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopoverTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'PopoverTrigger';

interface PopoverTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function PopoverTrigger(inProps: ScopedProps<PopoverTriggerProps>) {
  const [local, rest] = splitProps(inProps, ['__scopePopover', 'ref']);
  const context = usePopoverContext(TRIGGER_NAME, local.__scopePopover);
  const popperScope = usePopperScope(local.__scopePopover);

  const trigger = (
    <Primitive.button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={context.open}
      aria-controls={context.contentId}
      data-state={getState(context.open)}
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) => context.onTriggerRefChange(el as HTMLButtonElement))}
      onClick={composeEventHandlers(rest.onClick as any, context.onOpenToggle)}
    />
  );

  return (
    <Show when={context.hasCustomAnchor} fallback={
      <PopperAnchor {...popperScope}>
        {trigger}
      </PopperAnchor>
    }>
      {trigger}
    </Show>
  );
}

PopoverTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopoverPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'PopoverPortal';

type PortalContextValue = { forceMount?: true };
const [PortalProvider, usePortalContext] = createPopoverContext<PortalContextValue>(PORTAL_NAME, {
  forceMount: undefined,
});

interface PopoverPortalProps {
  children?: JSX.Element;
  container?: Element | DocumentFragment | null;
  forceMount?: true;
}

function PopoverPortal(props: ScopedProps<PopoverPortalProps>) {
  const [local] = splitProps(props, ['__scopePopover', 'forceMount', 'children', 'container']);

  // Portal is always mounted — visibility is controlled by Presence in PopoverContent.
  // This avoids the dual-Presence problem where the outer Presence would unmount
  // the portal before the inner exit animation completes.
  return (
    <PortalProvider scope={local.__scopePopover} forceMount={local.forceMount}>
      <PortalPrimitive container={local.container}>
        {local.children}
      </PortalPrimitive>
    </PortalProvider>
  );
}

PopoverPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopoverContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'PopoverContent';

interface PopoverContentProps extends Omit<PopoverContentImplProps, 'trapFocus' | 'disableOutsidePointerEvents'> {
  forceMount?: true;
}

function PopoverContent(inProps: ScopedProps<PopoverContentProps>) {
  const [local, rest] = splitProps(inProps, ['__scopePopover', 'forceMount']);
  const portalContext = usePortalContext(CONTENT_NAME, local.__scopePopover);
  const context = usePopoverContext(CONTENT_NAME, local.__scopePopover);
  const forceMount = () => local.forceMount ?? portalContext.forceMount;

  return (
    <Presence present={forceMount() || context.open}>
      <Show
        when={context.modal}
        fallback={<PopoverContentNonModal {...rest} __scopePopover={local.__scopePopover} />}
      >
        <PopoverContentModal {...rest} __scopePopover={local.__scopePopover} />
      </Show>
    </Presence>
  );
}

PopoverContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopoverContentModal
 * -----------------------------------------------------------------------------------------------*/

interface PopoverContentTypeProps
  extends Omit<PopoverContentImplProps, 'trapFocus' | 'disableOutsidePointerEvents'> {}

function PopoverContentModal(inProps: ScopedProps<PopoverContentTypeProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopePopover',
    'ref',
    'onCloseAutoFocus',
    'onPointerDownOutside',
    'onFocusOutside',
  ]);
  const context = usePopoverContext(CONTENT_NAME, local.__scopePopover);
  let contentRef: HTMLDivElement | undefined;
  let isRightClickOutside = false;

  // aria-hide everything except the content (better supported equivalent to setting aria-modal)
  createEffect(() => {
    if (contentRef) {
      const cleanup = hideOthers(contentRef);
      onCleanup(() => cleanup?.());
    }
  });

  return (
    <PopoverContentImpl
      {...rest}
      __scopePopover={local.__scopePopover}
      ref={mergeRefs(local.ref, (el: HTMLElement) => {
        contentRef = el as HTMLDivElement;
      })}
      // we make sure we're not trapping once it's been closed
      // (closed !== unmounted when animating out)
      trapFocus={context.open}
      disableOutsidePointerEvents
      onCloseAutoFocus={composeEventHandlers(local.onCloseAutoFocus, (event: Event) => {
        event.preventDefault();
        if (!isRightClickOutside) context.triggerRef?.focus();
      })}
      onPointerDownOutside={composeEventHandlers(
        local.onPointerDownOutside,
        (event: any) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          isRightClickOutside = isRightClick;
        },
      )}
      // When focus is trapped, a `focusout` event may still happen.
      // We make sure we don't trigger our `onDismiss` in such case.
      onFocusOutside={composeEventHandlers(
        local.onFocusOutside,
        (event: Event) => event.preventDefault(),
      )}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * PopoverContentNonModal
 * -----------------------------------------------------------------------------------------------*/

function PopoverContentNonModal(inProps: ScopedProps<PopoverContentTypeProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopePopover',
    'onCloseAutoFocus',
    'onInteractOutside',
  ]);
  const context = usePopoverContext(CONTENT_NAME, local.__scopePopover);
  let hasInteractedOutside = false;
  let hasPointerDownOutside = false;

  return (
    <PopoverContentImpl
      {...rest}
      __scopePopover={local.__scopePopover}
      trapFocus={false}
      disableOutsidePointerEvents={false}
      onCloseAutoFocus={(event: Event) => {
        local.onCloseAutoFocus?.(event);

        if (!event.defaultPrevented) {
          if (!hasInteractedOutside) context.triggerRef?.focus();
          // Always prevent auto focus because we either focus manually or want user agent focus
          event.preventDefault();
        }

        hasInteractedOutside = false;
        hasPointerDownOutside = false;
      }}
      onInteractOutside={(event: any) => {
        local.onInteractOutside?.(event);

        if (!event.defaultPrevented) {
          hasInteractedOutside = true;
          if (event.detail.originalEvent.type === 'pointerdown') {
            hasPointerDownOutside = true;
          }
        }

        // Prevent dismissing when clicking the trigger.
        // As the trigger is already setup to close, without doing so would
        // cause it to close and immediately open.
        const target = event.target as HTMLElement;
        const targetIsTrigger = context.triggerRef?.contains(target);
        if (targetIsTrigger) event.preventDefault();

        // On Safari if the trigger is inside a container with tabIndex={0}, when clicked
        // we will get the pointer down outside event on the trigger, but then a subsequent
        // focus outside event on the container, we ignore any focus outside event when we've
        // already had a pointer down outside event.
        if (event.detail.originalEvent.type === 'focusin' && hasPointerDownOutside) {
          event.preventDefault();
        }
      }}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * PopoverContentImpl
 * -----------------------------------------------------------------------------------------------*/

interface PopoverContentImplProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Element | Element[] | null;
  collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
  arrowPadding?: number;
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
  trapFocus?: boolean;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
  disableOutsidePointerEvents?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: any) => void;
  onFocusOutside?: (event: any) => void;
  onInteractOutside?: (event: any) => void;
}

function PopoverContentImpl(inProps: ScopedProps<PopoverContentImplProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopePopover',
    'ref',
    'side',
    'sideOffset',
    'align',
    'alignOffset',
    'avoidCollisions',
    'collisionBoundary',
    'collisionPadding',
    'arrowPadding',
    'sticky',
    'hideWhenDetached',
    'trapFocus',
    'onOpenAutoFocus',
    'onCloseAutoFocus',
    'disableOutsidePointerEvents',
    'onEscapeKeyDown',
    'onPointerDownOutside',
    'onFocusOutside',
    'onInteractOutside',
    'style',
  ]);

  const context = usePopoverContext(CONTENT_NAME, local.__scopePopover);
  const popperScope = usePopperScope(local.__scopePopover);

  // Make sure the whole tree has focus guards as our `Popover` may be
  // the last element in the DOM (because of the `Portal`)
  useFocusGuards();

  return (
    <FocusScope
      loop
      trapped={local.trapFocus}
      onMountAutoFocus={local.onOpenAutoFocus}
      onUnmountAutoFocus={local.onCloseAutoFocus}
    >
      <DismissableLayer
        asChild
        disableOutsidePointerEvents={local.disableOutsidePointerEvents}
        onInteractOutside={local.onInteractOutside}
        onEscapeKeyDown={local.onEscapeKeyDown}
        onPointerDownOutside={local.onPointerDownOutside}
        onFocusOutside={local.onFocusOutside}
        onDismiss={() => context.onOpenChange(false)}
      >
        <PopperContent
          data-state={getState(context.open)}
          role="dialog"
          id={context.contentId}
          {...popperScope}
          {...rest}
          ref={local.ref}
          side={local.side}
          sideOffset={local.sideOffset}
          align={local.align}
          alignOffset={local.alignOffset}
          avoidCollisions={local.avoidCollisions}
          collisionBoundary={local.collisionBoundary}
          collisionPadding={local.collisionPadding}
          arrowPadding={local.arrowPadding}
          sticky={local.sticky}
          hideWhenDetached={local.hideWhenDetached}
          style={{
            ...(typeof local.style === 'object' ? local.style : {}),
            // re-namespace exposed content custom properties
            '--radix-popover-content-transform-origin': 'var(--radix-popper-transform-origin)',
            '--radix-popover-content-available-width': 'var(--radix-popper-available-width)',
            '--radix-popover-content-available-height': 'var(--radix-popper-available-height)',
            '--radix-popover-trigger-width': 'var(--radix-popper-anchor-width)',
            '--radix-popover-trigger-height': 'var(--radix-popper-anchor-height)',
          } as JSX.CSSProperties}
        />
      </DismissableLayer>
    </FocusScope>
  );
}

/* -------------------------------------------------------------------------------------------------
 * PopoverClose
 * -----------------------------------------------------------------------------------------------*/

const CLOSE_NAME = 'PopoverClose';

interface PopoverCloseProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function PopoverClose(inProps: ScopedProps<PopoverCloseProps>) {
  const [local, rest] = splitProps(inProps, ['__scopePopover', 'ref']);
  const context = usePopoverContext(CLOSE_NAME, local.__scopePopover);

  return (
    <Primitive.button
      type="button"
      {...rest}
      ref={local.ref}
      onClick={composeEventHandlers(rest.onClick as any, () => context.onOpenChange(false))}
    />
  );
}

PopoverClose.displayName = CLOSE_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopoverArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'PopoverArrow';

interface PopoverArrowProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  ref?: (el: SVGSVGElement) => void;
}

function PopoverArrow(inProps: ScopedProps<PopoverArrowProps>) {
  const [local, rest] = splitProps(inProps, ['__scopePopover']);
  const popperScope = usePopperScope(local.__scopePopover);

  return <PopperArrow {...popperScope} {...rest} />;
}

PopoverArrow.displayName = ARROW_NAME;

/* -------------------------------------------------------------------------------------------------
 * Utils
 * -----------------------------------------------------------------------------------------------*/

function getState(open: boolean) {
  return open ? 'open' : 'closed';
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = Popover;
const Anchor = PopoverAnchor;
const Trigger = PopoverTrigger;
const PortalExport = PopoverPortal;
const Content = PopoverContent;
const Close = PopoverClose;
const Arrow = PopoverArrow;

export {
  createPopoverScope,
  //
  Popover,
  PopoverAnchor,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverClose,
  PopoverArrow,
  //
  Root,
  Anchor,
  Trigger,
  PortalExport as Portal,
  Content,
  Close,
  Arrow,
};
export type {
  PopoverProps,
  PopoverAnchorProps,
  PopoverTriggerProps,
  PopoverPortalProps,
  PopoverContentProps,
  PopoverCloseProps,
  PopoverArrowProps,
};
