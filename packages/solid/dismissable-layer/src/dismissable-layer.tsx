import {
  type JSX,
  createSignal,
  createEffect,
  onCleanup,
  splitProps,
  createContext,
  useContext,
} from "solid-js";
import { Primitive } from "@radix-solid-js/primitive-component";
import { mergeRefs } from "@radix-solid-js/compose-refs";
import { createEscapeKeydown } from "@radix-solid-js/use-escape-keydown";
import { usePresenceContext } from "@radix-solid-js/presence";

const POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
const FOCUS_OUTSIDE = "dismissableLayer.focusOutside";

let originalBodyPointerEvents: string;

interface DismissableLayerContextValue {
  layers: Set<HTMLElement>;
  layersWithOutsidePointerEventsDisabled: Set<HTMLElement>;
  branches: Set<HTMLElement>;
}

const DismissableLayerContext = createContext<DismissableLayerContextValue>({
  layers: new Set<HTMLElement>(),
  layersWithOutsidePointerEventsDisabled: new Set<HTMLElement>(),
  branches: new Set<HTMLElement>(),
});

/**
 * Module-level signal to track changes to layer sets.
 * Plain Set mutations are not tracked by SolidJS reactivity,
 * so we use this signal to notify components when layers change.
 */
const [layerVersion, setLayerVersion] = createSignal(0);
function notifyLayerChange() {
  setLayerVersion((v) => v + 1);
}

type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;

interface DismissableLayerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  disableOutsidePointerEvents?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (
    event: PointerDownOutsideEvent | FocusOutsideEvent
  ) => void;
  onDismiss?: () => void;
  ref?: (el: HTMLElement) => void;
}

function DismissableLayer(inProps: DismissableLayerProps) {
  const [local, rest] = splitProps(inProps, [
    "asChild",
    "disableOutsidePointerEvents",
    "onEscapeKeyDown",
    "onPointerDownOutside",
    "onFocusOutside",
    "onInteractOutside",
    "onDismiss",
    "ref",
  ]);

  const context = useContext(DismissableLayerContext);
  const presenceCtx = usePresenceContext();
  const [node, setNode] = createSignal<HTMLElement | null>(null);
  let isPointerInsideReactTreeRef = false;
  let isFocusInsideReactTreeRef = false;

  // Escape key handling
  createEscapeKeydown((event) => {
    const el = node();
    if (!el) return;
    const layers = Array.from(context.layers);
    const index = layers.indexOf(el);
    const isHighestLayer = index === context.layers.size - 1;
    if (!isHighestLayer) return;
    local.onEscapeKeyDown?.(event);
    if (!event.defaultPrevented && local.onDismiss) {
      event.preventDefault();
      local.onDismiss();
    }
  });

  // Pointer down outside
  createEffect(() => {
    const el = node();
    if (!el) return;
    const ownerDocument = el.ownerDocument ?? document;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target && !isPointerInsideReactTreeRef) {
        const eventDetail = { originalEvent: event };
        const customEvent = new CustomEvent(POINTER_DOWN_OUTSIDE, {
          bubbles: false,
          cancelable: true,
          detail: eventDetail,
        }) as PointerDownOutsideEvent;

        const target = event.target as HTMLElement;
        const isPointerDownOnBranch = [...context.branches].some((branch) =>
          branch.contains(target)
        );
        if (isPointerDownOnBranch) return;

        // Dispatch on the original target so event.target is properly set
        if (target) {
          target.addEventListener(POINTER_DOWN_OUTSIDE, (e) => local.onPointerDownOutside?.(e as PointerDownOutsideEvent), { once: true });
          target.addEventListener(POINTER_DOWN_OUTSIDE, (e) => local.onInteractOutside?.(e as PointerDownOutsideEvent), { once: true });
          target.dispatchEvent(customEvent);
        } else {
          local.onPointerDownOutside?.(customEvent);
          local.onInteractOutside?.(customEvent);
        }
        if (!customEvent.defaultPrevented) local.onDismiss?.();
      }
      isPointerInsideReactTreeRef = false;
    };

    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", handlePointerDown);
    }, 0);

    onCleanup(() => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
    });
  });

  // Focus outside
  // NOTE: Like the pointerdown handler, we defer registering the focusin listener
  // with setTimeout(0). This prevents the listener from catching focus events that
  // are part of the same user interaction that caused this layer to mount.
  // For example, when a menubar trigger is clicked, pointerdown opens the menu
  // (mounting the DismissableLayer), then focusin fires on the trigger. Without
  // the defer, the focusin would be detected as "outside" and immediately dismiss.
  createEffect(() => {
    const el = node();
    if (!el) return;
    const ownerDocument = el.ownerDocument ?? document;

    const handleFocus = (event: FocusEvent) => {
      if (event.target && !isFocusInsideReactTreeRef) {
        const target = event.target as HTMLElement;
        const isFocusInBranch = [...context.branches].some((branch) =>
          branch.contains(target)
        );
        if (isFocusInBranch) return;

        const customEvent = new CustomEvent(FOCUS_OUTSIDE, {
          bubbles: false,
          cancelable: true,
          detail: { originalEvent: event },
        }) as FocusOutsideEvent;

        // Dispatch on the original target so event.target is properly set
        if (target) {
          target.addEventListener(FOCUS_OUTSIDE, (e) => local.onFocusOutside?.(e as FocusOutsideEvent), { once: true });
          target.addEventListener(FOCUS_OUTSIDE, (e) => local.onInteractOutside?.(e as FocusOutsideEvent), { once: true });
          target.dispatchEvent(customEvent);
        } else {
          local.onFocusOutside?.(customEvent);
          local.onInteractOutside?.(customEvent);
        }
        if (!customEvent.defaultPrevented) local.onDismiss?.();
      }
    };

    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("focusin", handleFocus);
    }, 0);

    onCleanup(() => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("focusin", handleFocus);
    });
  });

  // Layer management
  createEffect(() => {
    const el = node();
    if (!el) return;
    const ownerDocument = el.ownerDocument ?? document;

    // Capture the boolean value now (not a reactive getter reference).
    // When cleanup runs during disposal, the reactive prop may already be false
    // (because the menu state changed first), causing the restore to be skipped.
    const disableOutsidePointerEvents = !!local.disableOutsidePointerEvents;

    if (disableOutsidePointerEvents) {
      if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
        originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
        ownerDocument.body.style.pointerEvents = "none";
      }
      context.layersWithOutsidePointerEventsDisabled.add(el);
    }
    context.layers.add(el);
    notifyLayerChange();

    onCleanup(() => {
      context.layers.delete(el);
      if (disableOutsidePointerEvents) {
        context.layersWithOutsidePointerEventsDisabled.delete(el);
        if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
          ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
        }
      }
      notifyLayerChange();
    });
  });

  // Read layerVersion() to subscribe to layer changes for reactivity.
  // Without this, SolidJS wouldn't know when the Sets are mutated.
  const layers = () => {
    layerVersion();
    return Array.from(context.layers);
  };
  const isBodyPointerEventsDisabled = () => {
    layerVersion();
    return context.layersWithOutsidePointerEventsDisabled.size > 0;
  };
  const highestDisabledIndex = () => {
    const arr = layers();
    const highest = [...context.layersWithOutsidePointerEventsDisabled].pop();
    return highest ? arr.indexOf(highest) : -1;
  };
  const isPointerEventsEnabled = () => {
    const el = node();
    if (!el) return true;
    return layers().indexOf(el) >= highestDisabledIndex();
  };

  // Register capture-phase event listeners manually.
  // React-style `onPointerDownCapture` does NOT work in SolidJS — it would
  // register a listener for the non-existent "pointerdowncapture" event.
  // Instead, we use addEventListener with capture:true directly on the node.
  createEffect(() => {
    const el = node();
    if (!el) return;

    const onPointerDownCapture = () => {
      isPointerInsideReactTreeRef = true;
    };
    const onFocusCapture = () => {
      isFocusInsideReactTreeRef = true;
    };
    const onBlurCapture = () => {
      isFocusInsideReactTreeRef = false;
    };

    el.addEventListener("pointerdown", onPointerDownCapture, true);
    el.addEventListener("focus", onFocusCapture, true);
    el.addEventListener("blur", onBlurCapture, true);

    onCleanup(() => {
      el.removeEventListener("pointerdown", onPointerDownCapture, true);
      el.removeEventListener("focus", onFocusCapture, true);
      el.removeEventListener("blur", onBlurCapture, true);
    });
  });

  // Reactively update pointer-events on the node.
  // When asChild is used, Primitive renders via Slot which applies props once
  // (non-reactively). But pointer-events depends on reactive signals
  // (isBodyPointerEventsDisabled, isPointerEventsEnabled) that change AFTER
  // the Slot has already applied the style. We must update pointer-events
  // imperatively via createEffect to keep the DOM in sync.
  createEffect(() => {
    const el = node();
    if (!el) return;
    if (isBodyPointerEventsDisabled()) {
      el.style.pointerEvents = isPointerEventsEnabled() ? "auto" : "none";
    } else {
      el.style.removeProperty("pointer-events");
    }
  });

  return (
    <Primitive.div
      asChild={local.asChild}
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) => {
        setNode(el);
        // Register with the nearest Presence ancestor for exit animation tracking.
        // Only register when rendering our own element (not asChild), because with
        // asChild the ref points to the child component's root element (e.g.
        // PopperContent's outer wrapper), which may not be the animated element.
        // When asChild is used, the child component (e.g. PopperContent) is
        // responsible for its own registerNode call.
        if (!local.asChild) {
          presenceCtx?.registerNode(el);
        }
      })}
      style={{
        ...(typeof rest.style === "object" ? rest.style : {}),
      }}
    />
  );
}

/* ----- DismissableLayerBranch ----- */

interface DismissableLayerBranchProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
}

function DismissableLayerBranch(inProps: DismissableLayerBranchProps) {
  const [local, rest] = splitProps(inProps, ["ref"]);
  const context = useContext(DismissableLayerContext);
  let ref!: HTMLElement;

  createEffect(() => {
    if (ref) {
      context.branches.add(ref);
      onCleanup(() => context.branches.delete(ref));
    }
  });

  return (
    <Primitive.div
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) => {
        ref = el;
      })}
    />
  );
}

export { DismissableLayer, DismissableLayerBranch };
export type { DismissableLayerProps };
