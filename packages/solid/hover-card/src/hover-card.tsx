import {
  type JSX,
  createSignal,
  createEffect,
  onCleanup,
  splitProps,
} from 'solid-js';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { mergeRefs } from '@radix-solid-js/compose-refs';
import { createContextScope, type Scope } from '@radix-solid-js/context';
import { DismissableLayer } from '@radix-solid-js/dismissable-layer';
import {
  createPopperScope,
  Popper,
  PopperAnchor,
  PopperContent,
  PopperArrow,
} from '@radix-solid-js/popper';
import { Portal } from '@radix-solid-js/portal';
import { Presence } from '@radix-solid-js/presence';
import { Primitive } from '@radix-solid-js/primitive-component';
import { createControllableSignal } from '@radix-solid-js/use-controllable-state';

/* -------------------------------------------------------------------------------------------------
 * HoverCard
 * -----------------------------------------------------------------------------------------------*/

let originalBodyUserSelect: string;

const HOVERCARD_NAME = 'HoverCard';

type ScopedProps<P> = P & { __scopeHoverCard?: Scope };
const [createHoverCardContext, createHoverCardScope] = createContextScope(
  HOVERCARD_NAME,
  [createPopperScope]
);
const usePopperScope = createPopperScope();

type HoverCardContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen: () => void;
  onClose: () => void;
  onDismiss: () => void;
  hasSelectionRef: { current: boolean };
  isPointerDownOnContentRef: { current: boolean };
};

const [HoverCardProvider, useHoverCardContext] =
  createHoverCardContext<HoverCardContextValue>(HOVERCARD_NAME);

interface HoverCardProps {
  children?: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
}

function HoverCard(inProps: ScopedProps<HoverCardProps>) {
  const [local] = splitProps(inProps, [
    '__scopeHoverCard',
    'children',
    'open',
    'defaultOpen',
    'onOpenChange',
    'openDelay',
    'closeDelay',
  ]);

  const popperScope = usePopperScope(local.__scopeHoverCard);

  let openTimerRef = 0;
  let closeTimerRef = 0;
  const hasSelectionRef = { current: false };
  const isPointerDownOnContentRef = { current: false };

  const openDelay = () => local.openDelay ?? 700;
  const closeDelay = () => local.closeDelay ?? 300;

  const [open, setOpen] = createControllableSignal({
    prop: () => local.open,
    defaultProp: local.defaultOpen ?? false,
    onChange: (value) => {
      local.onOpenChange?.(value);
    },
  });

  const handleOpen = () => {
    clearTimeout(closeTimerRef);
    openTimerRef = window.setTimeout(() => setOpen(true), openDelay());
  };

  const handleClose = () => {
    clearTimeout(openTimerRef);
    if (!hasSelectionRef.current && !isPointerDownOnContentRef.current) {
      closeTimerRef = window.setTimeout(() => setOpen(false), closeDelay());
    }
  };

  const handleDismiss = () => setOpen(false);

  // cleanup any queued state updates on unmount
  onCleanup(() => {
    clearTimeout(openTimerRef);
    clearTimeout(closeTimerRef);
  });

  return (
    <HoverCardProvider
      scope={local.__scopeHoverCard}
      open={open()}
      onOpenChange={setOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      onDismiss={handleDismiss}
      hasSelectionRef={hasSelectionRef}
      isPointerDownOnContentRef={isPointerDownOnContentRef}
    >
      <Popper {...popperScope}>{local.children}</Popper>
    </HoverCardProvider>
  );
}

HoverCard.displayName = HOVERCARD_NAME;

/* -------------------------------------------------------------------------------------------------
 * HoverCardTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'HoverCardTrigger';

interface HoverCardTriggerProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  ref?: (el: HTMLElement) => void;
}

function HoverCardTrigger(inProps: ScopedProps<HoverCardTriggerProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeHoverCard', 'ref']);
  const context = useHoverCardContext(TRIGGER_NAME, local.__scopeHoverCard);
  const popperScope = usePopperScope(local.__scopeHoverCard);

  return (
    <PopperAnchor asChild {...popperScope}>
      <Primitive.a
        data-state={context.open ? 'open' : 'closed'}
        {...rest}
        ref={local.ref}
        onPointerEnter={composeEventHandlers(rest.onPointerEnter as any, excludeTouch(context.onOpen))}
        onPointerLeave={composeEventHandlers(rest.onPointerLeave as any, excludeTouch(context.onClose))}
        onFocus={composeEventHandlers(rest.onFocus as any, context.onOpen)}
        onBlur={composeEventHandlers(rest.onBlur as any, context.onClose)}
        // prevent focus event on touch devices
        onTouchStart={composeEventHandlers(rest.onTouchStart as any, (event: TouchEvent) =>
          event.preventDefault()
        )}
      />
    </PopperAnchor>
  );
}

HoverCardTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * HoverCardPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'HoverCardPortal';

type PortalContextValue = { forceMount?: true };
const [PortalProvider, usePortalContext] = createHoverCardContext<PortalContextValue>(
  PORTAL_NAME,
  { forceMount: undefined }
);

interface HoverCardPortalProps {
  children?: JSX.Element;
  /**
   * Specify a container element to portal the content into.
   */
  container?: Element | DocumentFragment | null;
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true;
}

function HoverCardPortal(inProps: ScopedProps<HoverCardPortalProps>) {
  const [local] = splitProps(inProps, [
    '__scopeHoverCard',
    'children',
    'container',
    'forceMount',
  ]);

  // Portal is always mounted — visibility is controlled by Presence in HoverCardContent.
  // This avoids the dual-Presence problem where the outer Presence would unmount
  // the portal before the inner exit animation completes.
  return (
    <PortalProvider scope={local.__scopeHoverCard} forceMount={local.forceMount}>
      <Portal container={local.container}>
        {local.children}
      </Portal>
    </PortalProvider>
  );
}

HoverCardPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * HoverCardContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'HoverCardContent';

interface HoverCardContentProps extends HoverCardContentImplProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true;
}

function HoverCardContent(inProps: ScopedProps<HoverCardContentProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeHoverCard',
    'forceMount',
    'ref',
  ]);

  const portalContext = usePortalContext(CONTENT_NAME, local.__scopeHoverCard);
  const context = useHoverCardContext(CONTENT_NAME, local.__scopeHoverCard);
  const forceMount = () => local.forceMount ?? portalContext.forceMount;

  return (
    <Presence present={forceMount() || context.open}>
      <HoverCardContentImpl
        data-state={context.open ? 'open' : 'closed'}
        {...rest}
        __scopeHoverCard={local.__scopeHoverCard}
        onPointerEnter={composeEventHandlers(
          rest.onPointerEnter as any,
          excludeTouch(context.onOpen)
        )}
        onPointerLeave={composeEventHandlers(
          rest.onPointerLeave as any,
          excludeTouch(context.onClose)
        )}
        ref={local.ref}
      />
    </Presence>
  );
}

HoverCardContent.displayName = CONTENT_NAME;

/* ---------------------------------------------------------------------------------------------- */

interface HoverCardContentImplProps extends JSX.HTMLAttributes<HTMLDivElement> {
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
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: any) => void;
  onFocusOutside?: (event: any) => void;
  onInteractOutside?: (event: any) => void;
  ref?: (el: HTMLElement) => void;
}

function HoverCardContentImpl(inProps: ScopedProps<HoverCardContentImplProps & Record<string, any>>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeHoverCard',
    '__scopePopper',
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
    'onEscapeKeyDown',
    'onPointerDownOutside',
    'onFocusOutside',
    'onInteractOutside',
    'style',
    'children',
  ]);

  const context = useHoverCardContext(CONTENT_NAME, local.__scopeHoverCard);
  const popperScope = usePopperScope(local.__scopeHoverCard);

  let contentRef: HTMLDivElement | undefined;
  const [containSelection, setContainSelection] = createSignal(false);

  // Manage body user-select when containing selection
  createEffect(() => {
    if (containSelection()) {
      const body = document.body;
      // Safari requires prefix
      originalBodyUserSelect = body.style.userSelect || body.style.webkitUserSelect;
      body.style.userSelect = 'none';
      body.style.webkitUserSelect = 'none';

      onCleanup(() => {
        body.style.userSelect = originalBodyUserSelect;
        body.style.webkitUserSelect = originalBodyUserSelect;
      });
    }
  });

  // Listen for pointerup to stop selection containment
  createEffect(() => {
    if (contentRef) {
      const handlePointerUp = () => {
        setContainSelection(false);
        context.isPointerDownOnContentRef.current = false;

        // Delay a frame to ensure we always access the latest selection
        setTimeout(() => {
          const hasSelection = document.getSelection()?.toString() !== '';
          if (hasSelection) context.hasSelectionRef.current = true;
        });
      };

      document.addEventListener('pointerup', handlePointerUp);

      onCleanup(() => {
        document.removeEventListener('pointerup', handlePointerUp);
        context.hasSelectionRef.current = false;
        context.isPointerDownOnContentRef.current = false;
      });
    }
  });

  // Make tabbable nodes non-tabbable
  createEffect(() => {
    if (contentRef) {
      const tabbables = getTabbableNodes(contentRef);
      tabbables.forEach((tabbable) => tabbable.setAttribute('tabindex', '-1'));
    }
  });

  return (
    <DismissableLayer
      asChild
      disableOutsidePointerEvents={false}
      onInteractOutside={local.onInteractOutside}
      onEscapeKeyDown={local.onEscapeKeyDown}
      onPointerDownOutside={local.onPointerDownOutside}
      onFocusOutside={composeEventHandlers(local.onFocusOutside, (event: any) => {
        event.preventDefault();
      })}
      onDismiss={context.onDismiss}
    >
      <PopperContent
        {...popperScope}
        {...rest}
        ref={mergeRefs(local.ref, (el: HTMLElement) => (contentRef = el as HTMLDivElement))}
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
        onPointerDown={composeEventHandlers(rest.onPointerDown as any, (event: PointerEvent) => {
          // Contain selection to current layer
          if ((event.currentTarget as HTMLElement).contains(event.target as HTMLElement)) {
            setContainSelection(true);
          }
          context.hasSelectionRef.current = false;
          context.isPointerDownOnContentRef.current = true;
        })}
        style={{
          ...(typeof local.style === 'object' ? local.style : {}),
          'user-select': containSelection() ? 'text' : undefined,
          '-webkit-user-select': containSelection() ? 'text' : undefined,
          // re-namespace exposed content custom properties
          '--radix-hover-card-content-transform-origin': 'var(--radix-popper-transform-origin)',
          '--radix-hover-card-content-available-width': 'var(--radix-popper-available-width)',
          '--radix-hover-card-content-available-height': 'var(--radix-popper-available-height)',
          '--radix-hover-card-trigger-width': 'var(--radix-popper-anchor-width)',
          '--radix-hover-card-trigger-height': 'var(--radix-popper-anchor-height)',
        } as JSX.CSSProperties}
      >
        {local.children}
      </PopperContent>
    </DismissableLayer>
  );
}

/* -------------------------------------------------------------------------------------------------
 * HoverCardArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'HoverCardArrow';

interface HoverCardArrowProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  ref?: (el: SVGSVGElement) => void;
}

function HoverCardArrow(inProps: ScopedProps<HoverCardArrowProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeHoverCard']);
  const popperScope = usePopperScope(local.__scopeHoverCard);

  return <PopperArrow {...popperScope} {...rest} />;
}

HoverCardArrow.displayName = ARROW_NAME;

/* -----------------------------------------------------------------------------------------------*/

function excludeTouch(eventHandler: () => void) {
  return (event: PointerEvent) =>
    event.pointerType === 'touch' ? undefined : eventHandler();
}

/**
 * Returns a list of nodes that can be in the tab sequence.
 * @see: https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker
 */
function getTabbableNodes(container: HTMLElement) {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: any) => {
      // `.tabIndex` is not the same as the `tabindex` attribute. It works on the
      // runtime's understanding of tabbability, so this automatically accounts
      // for any kind of element that could be tabbed to.
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
  return nodes;
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = HoverCard;
const Trigger = HoverCardTrigger;
const HoverCardPortalExport = HoverCardPortal;
const Content = HoverCardContent;
const Arrow = HoverCardArrow;

export {
  createHoverCardScope,
  //
  HoverCard,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  HoverCardArrow,
  //
  Root,
  Trigger,
  HoverCardPortalExport as Portal,
  Content,
  Arrow,
};
export type {
  HoverCardProps,
  HoverCardTriggerProps,
  HoverCardPortalProps,
  HoverCardContentProps,
  HoverCardArrowProps,
};
