import {
  type JSX,
  splitProps,
  createSignal,
  createEffect,
  on,
  onMount,
  onCleanup,
  Show,
} from 'solid-js';
import { Portal as SolidPortal } from 'solid-js/web';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { createCollection } from '@radix-solid-js/collection';
import { createContextScope } from '@radix-solid-js/context';
import { DismissableLayerBranch } from '@radix-solid-js/dismissable-layer';
import { Primitive, dispatchDiscreteCustomEvent } from '@radix-solid-js/primitive-component';
import { mergeRefs } from '@radix-solid-js/compose-refs';
import { createControllableSignal } from '@radix-solid-js/use-controllable-state';
import { VisuallyHidden } from '@radix-solid-js/visually-hidden';
import { Presence } from '@radix-solid-js/presence';
import { Portal } from '@radix-solid-js/portal';

import type { Scope } from '@radix-solid-js/context';

/* -------------------------------------------------------------------------------------------------
 * ToastProvider
 * -----------------------------------------------------------------------------------------------*/

const PROVIDER_NAME = 'ToastProvider';

type ToastElement = HTMLLIElement;

const [Collection, useCollection, createCollectionScope] = createCollection<ToastElement>('Toast');

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

type ToastProviderContextValue = {
  label: string;
  duration: number;
  swipeDirection: SwipeDirection;
  swipeThreshold: number;
  toastCount: number;
  viewport: HTMLOListElement | null;
  onViewportChange(viewport: HTMLOListElement): void;
  onToastAdd(): void;
  onToastRemove(): void;
  isFocusedToastEscapeKeyDown: { current: boolean };
  isClosePaused: { current: boolean };
};

type ScopedProps<P> = P & { __scopeToast?: Scope };
const [createToastContext, createToastScope] = createContextScope('Toast', [
  createCollectionScope,
]);
const [ToastProviderProvider, useToastProviderContext] =
  createToastContext<ToastProviderContextValue>(PROVIDER_NAME);

interface ToastProviderProps {
  children?: JSX.Element;
  /**
   * An author-localized label for each toast. Used to help screen reader users
   * associate the interruption with a toast.
   * @defaultValue 'Notification'
   */
  label?: string;
  /**
   * Time in milliseconds that each toast should remain visible for.
   * @defaultValue 5000
   */
  duration?: number;
  /**
   * Direction of pointer swipe that should close the toast.
   * @defaultValue 'right'
   */
  swipeDirection?: SwipeDirection;
  /**
   * Distance in pixels that the swipe must pass before a close is triggered.
   * @defaultValue 50
   */
  swipeThreshold?: number;
}

function ToastProvider(props: ScopedProps<ToastProviderProps>) {
  const [local, _rest] = splitProps(props, [
    '__scopeToast',
    'label',
    'duration',
    'swipeDirection',
    'swipeThreshold',
    'children',
  ]);

  const label = () => local.label ?? 'Notification';
  const duration = () => local.duration ?? 5000;
  const swipeDirection = () => local.swipeDirection ?? 'right';
  const swipeThreshold = () => local.swipeThreshold ?? 50;

  const [viewport, setViewport] = createSignal<HTMLOListElement | null>(null);
  const [toastCount, setToastCount] = createSignal(0);
  const isFocusedToastEscapeKeyDown = { current: false };
  const isClosePaused = { current: false };

  if (typeof label() === 'string' && !label().trim()) {
    console.error(
      `Invalid prop \`label\` supplied to \`${PROVIDER_NAME}\`. Expected non-empty \`string\`.`
    );
  }

  return (
    <Collection.Provider scope={local.__scopeToast}>
      <ToastProviderProvider
        scope={local.__scopeToast}
        label={label()}
        duration={duration()}
        swipeDirection={swipeDirection()}
        swipeThreshold={swipeThreshold()}
        toastCount={toastCount()}
        viewport={viewport()}
        onViewportChange={setViewport}
        onToastAdd={() => setToastCount((prev) => prev + 1)}
        onToastRemove={() => setToastCount((prev) => prev - 1)}
        isFocusedToastEscapeKeyDown={isFocusedToastEscapeKeyDown}
        isClosePaused={isClosePaused}
      >
        {local.children}
      </ToastProviderProvider>
    </Collection.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToastViewport
 * -----------------------------------------------------------------------------------------------*/

const VIEWPORT_NAME = 'ToastViewport';
const VIEWPORT_DEFAULT_HOTKEY = ['F8'];
const VIEWPORT_PAUSE = 'toast.viewportPause';
const VIEWPORT_RESUME = 'toast.viewportResume';

interface ToastViewportProps extends JSX.HTMLAttributes<HTMLOListElement> {
  /**
   * The keys to use as the keyboard shortcut that will move focus to the toast viewport.
   * @defaultValue ['F8']
   */
  hotkey?: string[];
  /**
   * An author-localized label for the toast viewport to provide context for screen reader users
   * when navigating page landmarks. The available `{hotkey}` placeholder will be replaced for you.
   * @defaultValue 'Notifications ({hotkey})'
   */
  label?: string;
  ref?: (el: HTMLElement) => void;
}

function ToastViewport(inProps: ScopedProps<ToastViewportProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeToast',
    'hotkey',
    'label',
    'ref',
  ]);

  const context = useToastProviderContext(VIEWPORT_NAME, local.__scopeToast);
  const getItems = useCollection(local.__scopeToast);
  let wrapperRef!: HTMLDivElement;
  let viewportRef!: HTMLOListElement;

  const hotkey = () => local.hotkey ?? VIEWPORT_DEFAULT_HOTKEY;
  const labelStr = () => local.label ?? 'Notifications ({hotkey})';
  const hotkeyLabel = () =>
    hotkey().join('+').replace(/Key/g, '').replace(/Digit/g, '');
  const hasToasts = () => context.toastCount > 0;

  // Hotkey listener to focus viewport
  createEffect(() => {
    const keys = hotkey();
    const handleKeyDown = (event: KeyboardEvent) => {
      const isHotkeyPressed =
        keys.length !== 0 &&
        keys.every((key) => (event as any)[key] || event.code === key);
      if (isHotkeyPressed) viewportRef?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  });

  // Pause/resume close timers on hover/focus
  createEffect(() => {
    if (!hasToasts() || !wrapperRef || !viewportRef) return;

    const wrapper = wrapperRef;
    const viewport = viewportRef;

    const handlePause = () => {
      if (!context.isClosePaused.current) {
        const pauseEvent = new CustomEvent(VIEWPORT_PAUSE);
        viewport.dispatchEvent(pauseEvent);
        context.isClosePaused.current = true;
      }
    };

    const handleResume = () => {
      if (context.isClosePaused.current) {
        const resumeEvent = new CustomEvent(VIEWPORT_RESUME);
        viewport.dispatchEvent(resumeEvent);
        context.isClosePaused.current = false;
      }
    };

    const handleFocusOutResume = (event: FocusEvent) => {
      const isFocusMovingOutside = !wrapper.contains(event.relatedTarget as HTMLElement);
      if (isFocusMovingOutside) handleResume();
    };

    const handlePointerLeaveResume = () => {
      const isFocusInside = wrapper.contains(document.activeElement);
      if (!isFocusInside) handleResume();
    };

    wrapper.addEventListener('focusin', handlePause);
    wrapper.addEventListener('focusout', handleFocusOutResume);
    wrapper.addEventListener('pointermove', handlePause);
    wrapper.addEventListener('pointerleave', handlePointerLeaveResume);
    window.addEventListener('blur', handlePause);
    window.addEventListener('focus', handleResume);

    onCleanup(() => {
      wrapper.removeEventListener('focusin', handlePause);
      wrapper.removeEventListener('focusout', handleFocusOutResume);
      wrapper.removeEventListener('pointermove', handlePause);
      wrapper.removeEventListener('pointerleave', handlePointerLeaveResume);
      window.removeEventListener('blur', handlePause);
      window.removeEventListener('focus', handleResume);
    });
  });

  // Tab key management for reversed order navigation
  createEffect(() => {
    if (!viewportRef) return;
    const viewport = viewportRef;

    const getSortedTabbableCandidates = (tabbingDirection: 'forwards' | 'backwards') => {
      const toastItems = getItems();
      const tabbableCandidates = toastItems.map((toastItem) => {
        const toastNode = toastItem.ref;
        const toastTabbableCandidates = [toastNode, ...getTabbableCandidates(toastNode)];
        return tabbingDirection === 'forwards'
          ? toastTabbableCandidates
          : toastTabbableCandidates.reverse();
      });
      return (
        tabbingDirection === 'forwards' ? tabbableCandidates.reverse() : tabbableCandidates
      ).flat();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMetaKey = event.altKey || event.ctrlKey || event.metaKey;
      const isTabKey = event.key === 'Tab' && !isMetaKey;

      if (isTabKey) {
        const focusedElement = document.activeElement;
        const isTabbingBackwards = event.shiftKey;
        const tabbingDirection = isTabbingBackwards ? 'backwards' : 'forwards';
        const sortedCandidates = getSortedTabbableCandidates(tabbingDirection);
        const index = sortedCandidates.findIndex((candidate) => candidate === focusedElement);
        if (focusFirst(sortedCandidates.slice(index + 1))) {
          event.preventDefault();
        }
      }
    };

    viewport.addEventListener('keydown', handleKeyDown);
    onCleanup(() => viewport.removeEventListener('keydown', handleKeyDown));
  });

  return (
    <DismissableLayerBranch
      ref={(el: HTMLElement) => {
        wrapperRef = el as HTMLDivElement;
      }}
      role="region"
      aria-label={labelStr().replace('{hotkey}', hotkeyLabel())}
      tabIndex={-1}
      style={{ "pointer-events": hasToasts() ? undefined : 'none' }}
    >
      <Collection.Slot scope={local.__scopeToast}>
        <Primitive.ol
          tabIndex={-1}
          {...rest}
          ref={mergeRefs(local.ref, (el: HTMLElement) => {
            viewportRef = el as HTMLOListElement;
            context.onViewportChange(el as HTMLOListElement);
          })}
        />
      </Collection.Slot>
    </DismissableLayerBranch>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Toast
 * -----------------------------------------------------------------------------------------------*/

const TOAST_NAME = 'Toast';
const TOAST_SWIPE_START = 'toast.swipeStart';
const TOAST_SWIPE_MOVE = 'toast.swipeMove';
const TOAST_SWIPE_CANCEL = 'toast.swipeCancel';
const TOAST_SWIPE_END = 'toast.swipeEnd';

type SwipeEvent = {
  currentTarget: EventTarget & ToastElement;
} & Omit<
  CustomEvent<{ originalEvent: PointerEvent; delta: { x: number; y: number } }>,
  'currentTarget'
>;

interface ToastProps extends Omit<ToastImplProps, 'open' | 'onClose'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with SolidJS animation libraries.
   */
  forceMount?: true;
}

function Toast(inProps: ScopedProps<ToastProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeToast',
    'forceMount',
    'open',
    'defaultOpen',
    'onOpenChange',
    'onSwipeStart',
    'onSwipeMove',
    'onSwipeCancel',
    'onSwipeEnd',
    'onPause',
    'onResume',
  ]);

  const [open, setOpen] = createControllableSignal({
    prop: () => local.open,
    defaultProp: local.defaultOpen ?? true,
    onChange: local.onOpenChange,
    caller: TOAST_NAME,
  });

  return (
    <Presence present={local.forceMount || open()}>
      <ToastImpl
        open={open()}
        {...rest}
        __scopeToast={local.__scopeToast}
        onClose={() => setOpen(false)}
        onPause={local.onPause}
        onResume={local.onResume}
        onSwipeStart={composeEventHandlers<SwipeEvent>(local.onSwipeStart, (event) => {
          event.currentTarget.setAttribute('data-swipe', 'start');
        })}
        onSwipeMove={composeEventHandlers<SwipeEvent>(local.onSwipeMove, (event) => {
          const { x, y } = event.detail.delta;
          event.currentTarget.setAttribute('data-swipe', 'move');
          event.currentTarget.style.setProperty('--radix-toast-swipe-move-x', `${x}px`);
          event.currentTarget.style.setProperty('--radix-toast-swipe-move-y', `${y}px`);
        })}
        onSwipeCancel={composeEventHandlers<SwipeEvent>(local.onSwipeCancel, (event) => {
          event.currentTarget.setAttribute('data-swipe', 'cancel');
          event.currentTarget.style.removeProperty('--radix-toast-swipe-move-x');
          event.currentTarget.style.removeProperty('--radix-toast-swipe-move-y');
          event.currentTarget.style.removeProperty('--radix-toast-swipe-end-x');
          event.currentTarget.style.removeProperty('--radix-toast-swipe-end-y');
        })}
        onSwipeEnd={composeEventHandlers<SwipeEvent>(local.onSwipeEnd, (event) => {
          const { x, y } = event.detail.delta;
          event.currentTarget.setAttribute('data-swipe', 'end');
          event.currentTarget.style.removeProperty('--radix-toast-swipe-move-x');
          event.currentTarget.style.removeProperty('--radix-toast-swipe-move-y');
          event.currentTarget.style.setProperty('--radix-toast-swipe-end-x', `${x}px`);
          event.currentTarget.style.setProperty('--radix-toast-swipe-end-y', `${y}px`);
          setOpen(false);
        })}
      />
    </Presence>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToastImpl (internal)
 * -----------------------------------------------------------------------------------------------*/

const [ToastInteractiveProvider, useToastInteractiveContext] = createToastContext(TOAST_NAME, {
  onClose() {},
});

interface ToastImplProps extends JSX.HTMLAttributes<HTMLLIElement> {
  type?: 'foreground' | 'background';
  open: boolean;
  onClose(): void;
  /**
   * Time in milliseconds that toast should remain visible for. Overrides value
   * given to `ToastProvider`.
   */
  duration?: number;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPause?(): void;
  onResume?(): void;
  onSwipeStart?(event: SwipeEvent): void;
  onSwipeMove?(event: SwipeEvent): void;
  onSwipeCancel?(event: SwipeEvent): void;
  onSwipeEnd?(event: SwipeEvent): void;
  ref?: (el: HTMLElement) => void;
}

function ToastImpl(inProps: ScopedProps<ToastImplProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeToast',
    'type',
    'duration',
    'open',
    'onClose',
    'onEscapeKeyDown',
    'onPause',
    'onResume',
    'onSwipeStart',
    'onSwipeMove',
    'onSwipeCancel',
    'onSwipeEnd',
    'ref',
    'style',
    'onKeyDown',
    'onPointerDown',
    'onPointerMove',
    'onPointerUp',
  ]);

  const context = useToastProviderContext(TOAST_NAME, local.__scopeToast);
  let node: ToastElement | null = null;
  let pointerStart: { x: number; y: number } | null = null;
  let swipeDelta: { x: number; y: number } | null = null;
  let closeTimerStartTime = 0;
  let closeTimerRemainingTime: number;
  let closeTimer = 0;

  const type = () => local.type ?? 'foreground';
  const duration = () => local.duration ?? context.duration;

  closeTimerRemainingTime = duration();

  const handleClose = () => {
    // focus viewport if focus is within toast to read the remaining toast
    // count to SR users and ensure focus isn't lost
    const isFocusInToast = node?.contains(document.activeElement);
    if (isFocusInToast) context.viewport?.focus();
    local.onClose();
  };

  const startTimer = (dur: number) => {
    if (!dur || dur === Infinity) return;
    window.clearTimeout(closeTimer);
    closeTimerStartTime = new Date().getTime();
    closeTimer = window.setTimeout(handleClose, dur);
  };

  // Listen to viewport pause/resume events
  createEffect(() => {
    const viewport = context.viewport;
    if (!viewport) return;

    const handleResume = () => {
      startTimer(closeTimerRemainingTime);
      local.onResume?.();
    };

    const handlePause = () => {
      const elapsedTime = new Date().getTime() - closeTimerStartTime;
      closeTimerRemainingTime = closeTimerRemainingTime - elapsedTime;
      window.clearTimeout(closeTimer);
      local.onPause?.();
    };

    viewport.addEventListener(VIEWPORT_PAUSE, handlePause);
    viewport.addEventListener(VIEWPORT_RESUME, handleResume);

    onCleanup(() => {
      viewport.removeEventListener(VIEWPORT_PAUSE, handlePause);
      viewport.removeEventListener(VIEWPORT_RESUME, handleResume);
    });
  });

  // Start timer when toast opens or duration changes
  createEffect(
    on(
      () => [local.open, duration()] as const,
      ([isOpen, dur]) => {
        if (isOpen && !context.isClosePaused.current) {
          startTimer(dur);
        }
      }
    )
  );

  // Register/unregister toast count
  onMount(() => {
    context.onToastAdd();
  });
  onCleanup(() => {
    context.onToastRemove();
    window.clearTimeout(closeTimer);
  });

  // Announce text content for screen readers
  const [announceTextContent, setAnnounceTextContent] = createSignal<string[] | null>(null);
  createEffect(() => {
    if (node) {
      setAnnounceTextContent(getAnnounceTextContent(node));
    }
  });

  // Don't render if no viewport
  const hasViewport = () => context.viewport !== null;

  return (
    <Show when={hasViewport()}>
      <Show when={announceTextContent()}>
        <ToastAnnounce
          __scopeToast={local.__scopeToast}
          role="status"
          aria-live={type() === 'foreground' ? 'assertive' : 'polite'}
        >
          {announceTextContent()!}
        </ToastAnnounce>
      </Show>

      <ToastInteractiveProvider scope={local.__scopeToast} onClose={handleClose}>
        <SolidPortal mount={context.viewport!}>
          <Collection.ItemSlot scope={local.__scopeToast}>
            <Primitive.li
              tabIndex={0}
              data-state={local.open ? 'open' : 'closed'}
              data-swipe-direction={context.swipeDirection}
              {...rest}
              ref={mergeRefs(local.ref, (el: HTMLElement) => {
                node = el as ToastElement;
              })}
              style={{
                "user-select": 'none',
                "touch-action": 'none',
                ...(typeof local.style === 'object' ? local.style : {}),
              }}
              onKeyDown={composeEventHandlers<KeyboardEvent>(
                local.onKeyDown as ((event: KeyboardEvent) => void) | undefined,
                (event) => {
                  if (event.key !== 'Escape') return;
                  local.onEscapeKeyDown?.(event);
                  if (!event.defaultPrevented) {
                    context.isFocusedToastEscapeKeyDown.current = true;
                    handleClose();
                  }
                }
              )}
              onPointerDown={composeEventHandlers<PointerEvent>(
                local.onPointerDown as ((event: PointerEvent) => void) | undefined,
                (event) => {
                  if (event.button !== 0) return;
                  pointerStart = { x: event.clientX, y: event.clientY };
                }
              )}
              onPointerMove={composeEventHandlers<PointerEvent>(
                local.onPointerMove as ((event: PointerEvent) => void) | undefined,
                (event) => {
                  if (!pointerStart) return;
                  const x = event.clientX - pointerStart.x;
                  const y = event.clientY - pointerStart.y;
                  const hasSwipeMoveStarted = Boolean(swipeDelta);
                  const isHorizontalSwipe = ['left', 'right'].includes(context.swipeDirection);
                  const clamp = ['left', 'up'].includes(context.swipeDirection)
                    ? Math.min
                    : Math.max;
                  const clampedX = isHorizontalSwipe ? clamp(0, x) : 0;
                  const clampedY = !isHorizontalSwipe ? clamp(0, y) : 0;
                  const moveStartBuffer = event.pointerType === 'touch' ? 10 : 2;
                  const delta = { x: clampedX, y: clampedY };
                  const eventDetail = { originalEvent: event, delta };

                  if (hasSwipeMoveStarted) {
                    swipeDelta = delta;
                    handleAndDispatchCustomEvent(
                      TOAST_SWIPE_MOVE,
                      local.onSwipeMove,
                      eventDetail,
                      { discrete: false }
                    );
                  } else if (isDeltaInDirection(delta, context.swipeDirection, moveStartBuffer)) {
                    swipeDelta = delta;
                    handleAndDispatchCustomEvent(
                      TOAST_SWIPE_START,
                      local.onSwipeStart,
                      eventDetail,
                      { discrete: false }
                    );
                    (event.target as HTMLElement).setPointerCapture(event.pointerId);
                  } else if (Math.abs(x) > moveStartBuffer || Math.abs(y) > moveStartBuffer) {
                    // User is swiping in wrong direction so we disable swipe gesture
                    // for the current pointer down interaction
                    pointerStart = null;
                  }
                }
              )}
              onPointerUp={composeEventHandlers<PointerEvent>(
                local.onPointerUp as ((event: PointerEvent) => void) | undefined,
                (event) => {
                  const delta = swipeDelta;
                  const target = event.target as HTMLElement;
                  if (target.hasPointerCapture(event.pointerId)) {
                    target.releasePointerCapture(event.pointerId);
                  }
                  swipeDelta = null;
                  pointerStart = null;
                  if (delta) {
                    const toast = event.currentTarget;
                    const eventDetail = { originalEvent: event, delta };
                    if (
                      isDeltaInDirection(delta, context.swipeDirection, context.swipeThreshold)
                    ) {
                      handleAndDispatchCustomEvent(
                        TOAST_SWIPE_END,
                        local.onSwipeEnd,
                        eventDetail,
                        { discrete: true }
                      );
                    } else {
                      handleAndDispatchCustomEvent(
                        TOAST_SWIPE_CANCEL,
                        local.onSwipeCancel,
                        eventDetail,
                        { discrete: true }
                      );
                    }
                    // Prevent click event from triggering on items within the toast when
                    // pointer up is part of a swipe gesture
                    if (toast) {
                      (toast as HTMLElement).addEventListener('click', (e) => e.preventDefault(), {
                        once: true,
                      });
                    }
                  }
                }
              )}
            />
          </Collection.ItemSlot>
        </SolidPortal>
      </ToastInteractiveProvider>
    </Show>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToastAnnounce (internal)
 * -----------------------------------------------------------------------------------------------*/

interface ToastAnnounceProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  __scopeToast?: Scope;
  children: string[];
}

function ToastAnnounce(props: ToastAnnounceProps) {
  const [local, rest] = splitProps(props, ['__scopeToast', 'children', 'ref']);
  const context = useToastProviderContext(TOAST_NAME, local.__scopeToast);
  const [renderAnnounceText, setRenderAnnounceText] = createSignal(false);
  const [isAnnounced, setIsAnnounced] = createSignal(false);

  // Render text content in the next frame to ensure toast is announced in NVDA
  onMount(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(
      () => (raf2 = window.requestAnimationFrame(() => setRenderAnnounceText(true)))
    );
    onCleanup(() => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    });
  });

  // Cleanup after announcing
  onMount(() => {
    const timer = window.setTimeout(() => setIsAnnounced(true), 1000);
    onCleanup(() => window.clearTimeout(timer));
  });

  return (
    <Show when={!isAnnounced()}>
      <Portal>
        <VisuallyHidden {...rest}>
          <Show when={renderAnnounceText()}>
            {context.label} {local.children.join(' ')}
          </Show>
        </VisuallyHidden>
      </Portal>
    </Show>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToastTitle
 * -----------------------------------------------------------------------------------------------*/

interface ToastTitleProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
}

function ToastTitle(inProps: ScopedProps<ToastTitleProps>) {
  const [_local, rest] = splitProps(inProps, ['__scopeToast']);
  return <Primitive.div {...rest} />;
}

/* -------------------------------------------------------------------------------------------------
 * ToastDescription
 * -----------------------------------------------------------------------------------------------*/

interface ToastDescriptionProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
}

function ToastDescription(inProps: ScopedProps<ToastDescriptionProps>) {
  const [_local, rest] = splitProps(inProps, ['__scopeToast']);
  return <Primitive.div {...rest} />;
}

/* -------------------------------------------------------------------------------------------------
 * ToastAction
 * -----------------------------------------------------------------------------------------------*/

const ACTION_NAME = 'ToastAction';

interface ToastActionProps extends ToastCloseProps {
  /**
   * A short description for an alternate way to carry out the action. For screen reader users
   * who will not be able to navigate to the button easily/quickly.
   * @example <ToastAction altText="Goto account settings to upgrade">Upgrade</ToastAction>
   * @example <ToastAction altText="Undo (Alt+U)">Undo</ToastAction>
   */
  altText: string;
}

function ToastAction(inProps: ScopedProps<ToastActionProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeToast', 'altText']);

  if (!local.altText.trim()) {
    console.error(
      `Invalid prop \`altText\` supplied to \`${ACTION_NAME}\`. Expected non-empty \`string\`.`
    );
    return null;
  }

  return (
    <ToastAnnounceExclude altText={local.altText}>
      <ToastClose {...rest} __scopeToast={local.__scopeToast} />
    </ToastAnnounceExclude>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToastClose
 * -----------------------------------------------------------------------------------------------*/

const CLOSE_NAME = 'ToastClose';

interface ToastCloseProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function ToastClose(inProps: ScopedProps<ToastCloseProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeToast', 'onClick']);
  const interactiveContext = useToastInteractiveContext(CLOSE_NAME, local.__scopeToast);

  return (
    <ToastAnnounceExclude>
      <Primitive.button
        type="button"
        {...rest}
        onClick={composeEventHandlers<MouseEvent>(
          local.onClick as ((event: MouseEvent) => void) | undefined,
          interactiveContext.onClose
        )}
      />
    </ToastAnnounceExclude>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToastAnnounceExclude (internal)
 * -----------------------------------------------------------------------------------------------*/

interface ToastAnnounceExcludeProps extends JSX.HTMLAttributes<HTMLElement> {
  altText?: string;
}

function ToastAnnounceExclude(props: ToastAnnounceExcludeProps) {
  const [local, rest] = splitProps(props, ['altText', 'ref']);
  return (
    <Primitive.div
      data-radix-toast-announce-exclude=""
      data-radix-toast-announce-alt={local.altText || undefined}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Utility: getAnnounceTextContent
 * -----------------------------------------------------------------------------------------------*/

function getAnnounceTextContent(container: HTMLElement): string[] {
  const textContent: string[] = [];
  const childNodes = Array.from(container.childNodes);

  childNodes.forEach((childNode) => {
    if (childNode.nodeType === childNode.TEXT_NODE && childNode.textContent) {
      textContent.push(childNode.textContent);
    }
    if (isHTMLElement(childNode)) {
      const isHidden =
        childNode.ariaHidden || childNode.hidden || childNode.style.display === 'none';
      const isExcluded = childNode.dataset.radixToastAnnounceExclude === '';

      if (!isHidden) {
        if (isExcluded) {
          const altText = childNode.dataset.radixToastAnnounceAlt;
          if (altText) textContent.push(altText);
        } else {
          textContent.push(...getAnnounceTextContent(childNode));
        }
      }
    }
  });

  return textContent;
}

/* -------------------------------------------------------------------------------------------------
 * Utility: handleAndDispatchCustomEvent
 * -----------------------------------------------------------------------------------------------*/

function handleAndDispatchCustomEvent<E extends CustomEvent>(
  name: string,
  handler: ((event: E) => void) | undefined,
  detail: Record<string, any>,
  { discrete }: { discrete: boolean }
) {
  const currentTarget = detail.originalEvent.currentTarget as HTMLElement;
  const event = new CustomEvent(name, {
    bubbles: true,
    cancelable: true,
    detail,
  });
  if (handler) {
    currentTarget.addEventListener(name, handler as EventListener, { once: true });
  }

  if (discrete) {
    dispatchDiscreteCustomEvent(currentTarget, event);
  } else {
    currentTarget.dispatchEvent(event);
  }
}

/* -------------------------------------------------------------------------------------------------
 * Utility: isDeltaInDirection
 * -----------------------------------------------------------------------------------------------*/

const isDeltaInDirection = (
  delta: { x: number; y: number },
  direction: SwipeDirection,
  threshold = 0
) => {
  const deltaX = Math.abs(delta.x);
  const deltaY = Math.abs(delta.y);
  const isDeltaX = deltaX > deltaY;
  if (direction === 'left' || direction === 'right') {
    return isDeltaX && deltaX > threshold;
  } else {
    return !isDeltaX && deltaY > threshold;
  }
};

/* -------------------------------------------------------------------------------------------------
 * Utility: isHTMLElement
 * -----------------------------------------------------------------------------------------------*/

function isHTMLElement(node: any): node is HTMLElement {
  return node.nodeType === node.ELEMENT_NODE;
}

/* -------------------------------------------------------------------------------------------------
 * Utility: getTabbableCandidates
 * -----------------------------------------------------------------------------------------------*/

function getTabbableCandidates(container: HTMLElement) {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: any) => {
      const isHiddenInput = node.tagName === 'INPUT' && node.type === 'hidden';
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
  return nodes;
}

/* -------------------------------------------------------------------------------------------------
 * Utility: focusFirst
 * -----------------------------------------------------------------------------------------------*/

function focusFirst(candidates: HTMLElement[]) {
  const previouslyFocusedElement = document.activeElement;
  return candidates.some((candidate) => {
    if (candidate === previouslyFocusedElement) return true;
    candidate.focus();
    return document.activeElement !== previouslyFocusedElement;
  });
}

/* -------------------------------------------------------------------------------------------------
 * Aliases
 * -----------------------------------------------------------------------------------------------*/

const Provider = ToastProvider;
const Viewport = ToastViewport;
const Root = Toast;
const Title = ToastTitle;
const Description = ToastDescription;
const Action = ToastAction;
const Close = ToastClose;

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

export {
  createToastScope,
  //
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  //
  Provider,
  Viewport,
  Root,
  Title,
  Description,
  Action,
  Close,
};
export type {
  ToastProviderProps,
  ToastViewportProps,
  ToastProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastActionProps,
  ToastCloseProps,
  SwipeDirection,
};
