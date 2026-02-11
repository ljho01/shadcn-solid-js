import {
  type JSX,
  createSignal,
  createEffect,
  onCleanup,
  onMount,
  splitProps,
  createContext,
  useContext,
} from 'solid-js';
import { composeEventHandlers } from '@radix-solid/primitive';
import { mergeRefs } from '@radix-solid/compose-refs';
import { createContextScope, type Scope } from '@radix-solid/context';
import { DismissableLayer } from '@radix-solid/dismissable-layer';
import { createId } from '@radix-solid/id';
import {
  createPopperScope,
  Popper,
  PopperAnchor,
  PopperContent,
  PopperArrow,
} from '@radix-solid/popper';
import { Portal } from '@radix-solid/portal';
import { Presence } from '@radix-solid/presence';
import { Primitive } from '@radix-solid/primitive-component';
import { createControllableSignal } from '@radix-solid/use-controllable-state';
import { VisuallyHidden } from '@radix-solid/visually-hidden';

/* -------------------------------------------------------------------------------------------------
 * TooltipProvider
 * -----------------------------------------------------------------------------------------------*/

const PROVIDER_NAME = 'TooltipProvider';
const DEFAULT_DELAY_DURATION = 700;
const TOOLTIP_OPEN = 'tooltip.open';

interface TooltipProviderContextValue {
  isOpenDelayed: boolean;
  delayDuration: number;
  onOpen: () => void;
  onClose: () => void;
  isPointerInTransit: boolean;
  onPointerInTransitChange: (inTransit: boolean) => void;
  disableHoverableContent: boolean;
}

const TooltipProviderContext = createContext<TooltipProviderContextValue>();

function useTooltipProviderContext() {
  const context = useContext(TooltipProviderContext);
  if (!context) {
    throw new Error(`${PROVIDER_NAME} must be used within a TooltipProvider`);
  }
  return context;
}

interface TooltipProviderProps {
  children: JSX.Element;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}

function TooltipProvider(props: TooltipProviderProps) {
  const [local] = splitProps(props, [
    'children',
    'delayDuration',
    'skipDelayDuration',
    'disableHoverableContent',
  ]);

  const delayDuration = () => local.delayDuration ?? DEFAULT_DELAY_DURATION;
  const skipDelayDuration = () => local.skipDelayDuration ?? 300;
  const disableHoverableContent = () => local.disableHoverableContent ?? false;

  const [isOpenDelayed, setIsOpenDelayed] = createSignal(true);
  const [isPointerInTransit, setIsPointerInTransit] = createSignal(false);
  let skipDelayTimerRef = 0;

  const handleOpen = () => {
    window.clearTimeout(skipDelayTimerRef);
    setIsOpenDelayed(false);
  };

  const handleClose = () => {
    window.clearTimeout(skipDelayTimerRef);
    skipDelayTimerRef = window.setTimeout(
      () => setIsOpenDelayed(true),
      skipDelayDuration()
    );
  };

  onCleanup(() => {
    window.clearTimeout(skipDelayTimerRef);
  });

  const contextValue: TooltipProviderContextValue = {
    get isOpenDelayed() { return isOpenDelayed(); },
    get delayDuration() { return delayDuration(); },
    onOpen: handleOpen,
    onClose: handleClose,
    get isPointerInTransit() { return isPointerInTransit(); },
    onPointerInTransitChange: setIsPointerInTransit,
    get disableHoverableContent() { return disableHoverableContent(); },
  };

  return (
    <TooltipProviderContext.Provider value={contextValue}>
      {local.children}
    </TooltipProviderContext.Provider>
  );
}

TooltipProvider.displayName = PROVIDER_NAME;

/* -------------------------------------------------------------------------------------------------
 * Tooltip
 * -----------------------------------------------------------------------------------------------*/

const TOOLTIP_NAME = 'Tooltip';

type ScopedProps<P> = P & { __scopeTooltip?: Scope };
const [createTooltipContext, createTooltipScope] = createContextScope(
  TOOLTIP_NAME,
  [createPopperScope]
);
const usePopperScope = createPopperScope();

type TooltipContextValue = {
  contentId: string;
  open: boolean;
  stateAttribute: 'closed' | 'delayed-open' | 'instant-open';
  trigger: HTMLButtonElement | null;
  onTriggerChange: (trigger: HTMLButtonElement | null) => void;
  onTriggerEnter: () => void;
  onTriggerLeave: () => void;
  onOpen: () => void;
  onClose: () => void;
  disableHoverableContent: boolean;
  onContentEnter: () => void;
  onContentLeave: () => void;
};

const [TooltipContextProvider, useTooltipContext] =
  createTooltipContext<TooltipContextValue>(TOOLTIP_NAME);

interface TooltipProps {
  children: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  disableHoverableContent?: boolean;
}

function Tooltip(inProps: ScopedProps<TooltipProps>) {
  const [local] = splitProps(inProps, [
    '__scopeTooltip',
    'children',
    'open',
    'defaultOpen',
    'onOpenChange',
    'delayDuration',
    'disableHoverableContent',
  ]);

  const providerContext = useTooltipProviderContext();
  const popperScope = usePopperScope(local.__scopeTooltip);

  const [trigger, setTrigger] = createSignal<HTMLButtonElement | null>(null);
  const contentId = createId();
  let openTimerRef = 0;
  let closeGraceTimerRef = 0;
  let isContentHovered = false;

  const delayDuration = () => local.delayDuration ?? providerContext.delayDuration;
  const disableHoverableContent = () =>
    local.disableHoverableContent ?? providerContext.disableHoverableContent;

  const [open, setOpen] = createControllableSignal({
    prop: () => local.open,
    defaultProp: local.defaultOpen ?? false,
    onChange: (value) => {
      if (value) {
        providerContext.onOpen();
        // Dispatch open event on document for other tooltips to close
        document.dispatchEvent(new CustomEvent(TOOLTIP_OPEN));
      } else {
        providerContext.onClose();
      }
      local.onOpenChange?.(value);
    },
  });

  const wasOpenDelayed = createSignal(false);
  const [stateAttribute, setStateAttribute] = createSignal<'closed' | 'delayed-open' | 'instant-open'>('closed');

  // Update state attribute when open changes
  createEffect(() => {
    if (open()) {
      setStateAttribute(wasOpenDelayed[0]() ? 'delayed-open' : 'instant-open');
    } else {
      setStateAttribute('closed');
    }
  });

  const handleOpen = () => {
    window.clearTimeout(openTimerRef);
    window.clearTimeout(closeGraceTimerRef);
    wasOpenDelayed[1](false);
    setOpen(true);
  };

  const handleClose = () => {
    window.clearTimeout(openTimerRef);
    window.clearTimeout(closeGraceTimerRef);
    setOpen(false);
  };

  const handleDelayedOpen = () => {
    const duration = delayDuration();
    if (duration <= 0 || !providerContext.isOpenDelayed) {
      handleOpen();
    } else {
      window.clearTimeout(openTimerRef);
      openTimerRef = window.setTimeout(() => {
        wasOpenDelayed[1](true);
        setOpen(true);
      }, duration);
    }
  };

  onCleanup(() => {
    window.clearTimeout(openTimerRef);
    window.clearTimeout(closeGraceTimerRef);
  });

  return (
    <Popper {...popperScope}>
      <TooltipContextProvider
        scope={local.__scopeTooltip}
        contentId={contentId}
        open={open()}
        stateAttribute={stateAttribute()}
        trigger={trigger()}
        onTriggerChange={setTrigger}
        onTriggerEnter={() => {
          window.clearTimeout(closeGraceTimerRef);
          isContentHovered = false;
          handleDelayedOpen();
        }}
        onTriggerLeave={() => {
          window.clearTimeout(openTimerRef);
          if (disableHoverableContent()) {
            handleClose();
          } else {
            // Grace period: allow user to move from trigger to content
            // Close after 150ms if mouse doesn't enter content
            window.clearTimeout(closeGraceTimerRef);
            closeGraceTimerRef = window.setTimeout(() => {
              if (!isContentHovered) {
                handleClose();
              }
            }, 150);
          }
        }}
        onOpen={handleOpen}
        onClose={handleClose}
        disableHoverableContent={disableHoverableContent()}
        onContentEnter={() => {
          window.clearTimeout(closeGraceTimerRef);
          isContentHovered = true;
        }}
        onContentLeave={() => {
          isContentHovered = false;
          handleClose();
        }}
      >
        {local.children}
      </TooltipContextProvider>
    </Popper>
  );
}

Tooltip.displayName = TOOLTIP_NAME;

/* -------------------------------------------------------------------------------------------------
 * TooltipTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'TooltipTrigger';

interface TooltipTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function TooltipTrigger(inProps: ScopedProps<TooltipTriggerProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeTooltip', 'ref']);
  const context = useTooltipContext(TRIGGER_NAME, local.__scopeTooltip);
  const popperScope = usePopperScope(local.__scopeTooltip);

  let isPointerDownRef = false;
  let hasPointerMovedSinceMount = false;
  let handlePointerUpTimer = 0;

  onMount(() => {
    // Wait for first pointermove before allowing open
    const handler = () => { hasPointerMovedSinceMount = true; };
    document.addEventListener('pointermove', handler, { once: true });
    onCleanup(() => document.removeEventListener('pointermove', handler));
  });

  onCleanup(() => {
    window.clearTimeout(handlePointerUpTimer);
  });

  return (
    <PopperAnchor {...popperScope}>
      <Primitive.button
        // Ensure tooltip does not appear during long press
        aria-describedby={context.open ? context.contentId : undefined}
        data-state={context.stateAttribute}
        {...rest}
        ref={mergeRefs(local.ref, (el: HTMLElement) => context.onTriggerChange(el as HTMLButtonElement))}
        onPointerMove={composeEventHandlers(rest.onPointerMove as any, (event: PointerEvent) => {
          if (event.pointerType === 'touch') return;
          if (!hasPointerMovedSinceMount || isPointerDownRef) return;
          context.onTriggerEnter();
        })}
        onPointerLeave={composeEventHandlers(rest.onPointerLeave as any, () => {
          context.onTriggerLeave();
        })}
        onPointerDown={composeEventHandlers(rest.onPointerDown as any, () => {
          isPointerDownRef = true;
          context.onClose();
        })}
        onFocus={composeEventHandlers(rest.onFocus as any, () => {
          if (!isPointerDownRef) context.onOpen();
        })}
        onBlur={composeEventHandlers(rest.onBlur as any, () => {
          context.onClose();
        })}
        onClick={composeEventHandlers(rest.onClick as any, () => {
          context.onClose();
        })}
      />
    </PopperAnchor>
  );
}

TooltipTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * TooltipPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'TooltipPortal';

interface TooltipPortalProps {
  children: JSX.Element;
  container?: Element | DocumentFragment | null;
  forceMount?: true;
}

function TooltipPortal(inProps: ScopedProps<TooltipPortalProps>) {
  const [local] = splitProps(inProps, [
    '__scopeTooltip',
    'children',
    'container',
    'forceMount',
  ]);

  // Portal is always mounted — visibility is controlled by Presence in TooltipContent.
  // This avoids the dual-Presence problem where the outer Presence would unmount
  // the portal before the inner exit animation completes.
  return (
    <Portal container={local.container}>
      {local.children}
    </Portal>
  );
}

TooltipPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * TooltipContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'TooltipContent';

interface TooltipContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
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
  ref?: (el: HTMLElement) => void;
}

function TooltipContent(inProps: ScopedProps<TooltipContentProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeTooltip',
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
    'style',
  ]);

  const context = useTooltipContext(CONTENT_NAME, local.__scopeTooltip);
  const popperScope = usePopperScope(local.__scopeTooltip);

  return (
    <Presence present={context.open}>
      <TooltipContentImpl
        {...rest}
        {...popperScope}
        __scopeTooltip={local.__scopeTooltip}
        ref={local.ref}
        side={local.side ?? 'top'}
        sideOffset={local.sideOffset ?? 0}
        align={local.align ?? 'center'}
        alignOffset={local.alignOffset}
        avoidCollisions={local.avoidCollisions}
        collisionBoundary={local.collisionBoundary}
        collisionPadding={local.collisionPadding}
        arrowPadding={local.arrowPadding}
        sticky={local.sticky}
        hideWhenDetached={local.hideWhenDetached}
        onEscapeKeyDown={local.onEscapeKeyDown}
        onPointerDownOutside={local.onPointerDownOutside}
        style={local.style}
      />
    </Presence>
  );
}

TooltipContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * TooltipContentImpl
 * -----------------------------------------------------------------------------------------------*/

function TooltipContentImpl(inProps: ScopedProps<TooltipContentProps & Record<string, any>>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeTooltip',
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
    'style',
    'children',
  ]);

  const context = useTooltipContext('TooltipContentImpl', local.__scopeTooltip);
  const providerContext = useTooltipProviderContext();

  // Close this tooltip when another one opens.
  // This listener is in TooltipContentImpl (not Tooltip root) so it only
  // fires for already-open tooltips. The newly-opening tooltip dispatches
  // TOOLTIP_OPEN before this component mounts, avoiding the self-close bug.
  createEffect(() => {
    const handler = () => {
      context.onClose();
    };
    document.addEventListener(TOOLTIP_OPEN, handler);
    onCleanup(() => document.removeEventListener(TOOLTIP_OPEN, handler));
  });

  // Close on escape
  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    local.onEscapeKeyDown?.(event);
    if (!event.defaultPrevented) {
      context.onClose();
    }
  };

  // Close on pointer down outside
  const handlePointerDownOutside = (event: any) => {
    local.onPointerDownOutside?.(event);
    if (!event.defaultPrevented) {
      context.onClose();
    }
  };

  return (
    <DismissableLayer
      asChild
      disableOutsidePointerEvents={false}
      onEscapeKeyDown={handleEscapeKeyDown}
      onPointerDownOutside={handlePointerDownOutside}
      onDismiss={() => context.onClose()}
    >
      <PopperContent
        data-state={context.stateAttribute}
        {...rest}
        __scopePopper={local.__scopePopper}
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
          '--radix-tooltip-content-transform-origin': 'var(--radix-popper-transform-origin)',
          '--radix-tooltip-content-available-width': 'var(--radix-popper-available-width)',
          '--radix-tooltip-content-available-height': 'var(--radix-popper-available-height)',
          '--radix-tooltip-trigger-width': 'var(--radix-popper-anchor-width)',
          '--radix-tooltip-trigger-height': 'var(--radix-popper-anchor-height)',
        } as JSX.CSSProperties}
        onPointerEnter={composeEventHandlers(rest.onPointerEnter as any, () => {
          // Keep tooltip open when hovering content (if hoverable)
          if (!context.disableHoverableContent) {
            context.onContentEnter();
            providerContext.onPointerInTransitChange(false);
          }
        })}
        onPointerLeave={composeEventHandlers(rest.onPointerLeave as any, () => {
          if (!context.disableHoverableContent) {
            context.onContentLeave();
          } else {
            context.onClose();
          }
        })}
      >
        {local.children}
        {/* VisuallyHidden for screen readers to announce when tooltip opens */}
        <VisuallyHidden
          role="tooltip"
          id={context.contentId}
        >
          {local.children}
        </VisuallyHidden>
      </PopperContent>
    </DismissableLayer>
  );
}

/* -------------------------------------------------------------------------------------------------
 * TooltipArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'TooltipArrow';

interface TooltipArrowProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  ref?: (el: SVGSVGElement) => void;
}

function TooltipArrow(inProps: ScopedProps<TooltipArrowProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeTooltip']);
  const popperScope = usePopperScope(local.__scopeTooltip);

  return (
    <PopperArrow
      {...popperScope}
      {...rest}
    />
  );
}

TooltipArrow.displayName = ARROW_NAME;

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Provider = TooltipProvider;
const Root = Tooltip;
const Trigger = TooltipTrigger;
const TooltipPortalExport = TooltipPortal;
const Content = TooltipContent;
const Arrow = TooltipArrow;

export {
  createTooltipScope,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
  Provider,
  Root,
  Trigger,
  TooltipPortalExport as Portal,
  Content,
  Arrow,
};
export type {
  TooltipProviderProps,
  TooltipProps,
  TooltipTriggerProps,
  TooltipPortalProps,
  TooltipContentProps,
  TooltipArrowProps,
};
