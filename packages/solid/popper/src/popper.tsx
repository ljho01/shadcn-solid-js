import {
  type JSX,
  createSignal,
  createEffect,
  createMemo,
  onCleanup,
  splitProps,
} from "solid-js";
import {
  computePosition,
  autoUpdate,
  offset,
  shift,
  limitShift,
  hide,
  arrow as floatingUIarrow,
  flip,
  size as sizeMiddleware,
  type Placement,
  type Middleware,
} from "@floating-ui/dom";
import { Arrow as ArrowPrimitive } from "@radix-solid-js/arrow";
import { mergeRefs } from "@radix-solid-js/compose-refs";
import { createContextScope, type Scope } from "@radix-solid-js/context";
import { usePresenceContext } from "@radix-solid-js/presence";
import { Primitive } from "@radix-solid-js/primitive-component";
import { createElementSize } from "@radix-solid-js/use-size";

type Measurable = { getBoundingClientRect(): DOMRect };

const SIDE_OPTIONS = ["top", "right", "bottom", "left"] as const;
const ALIGN_OPTIONS = ["start", "center", "end"] as const;

type Side = (typeof SIDE_OPTIONS)[number];
type Align = (typeof ALIGN_OPTIONS)[number];

const POPPER_NAME = "Popper";

type ScopedProps<P> = P & { __scopePopper?: Scope };
const [createPopperContext, createPopperScope] =
  createContextScope(POPPER_NAME);

type PopperContextValue = {
  anchor: Measurable | null;
  onAnchorChange(anchor: Measurable | null): void;
};
const [PopperProvider, usePopperContext] =
  createPopperContext<PopperContextValue>(POPPER_NAME);

interface PopperProps {
  children?: JSX.Element;
}

function Popper(props: ScopedProps<PopperProps>) {
  const [anchor, setAnchor] = createSignal<Measurable | null>(null);
  return (
    <PopperProvider
      scope={props.__scopePopper}
      anchor={anchor()}
      onAnchorChange={setAnchor}
    >
      {props.children}
    </PopperProvider>
  );
}

interface PopperAnchorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** In SolidJS, pass the Measurable directly (no .current wrapper needed). */
  virtualRef?: Measurable;
  asChild?: boolean;
  ref?: (el: HTMLElement) => void;
}

function PopperAnchor(inProps: ScopedProps<PopperAnchorProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopePopper",
    "virtualRef",
    "ref",
  ]);
  const context = usePopperContext("PopperAnchor", local.__scopePopper);
  const [ref, setRef] = createSignal<HTMLDivElement | null>(null);

  // Track anchor changes — mirrors React's useEffect approach.
  // When using asChild with Slot, the ref may fire before DOM insertion,
  // so we retry via rAF for disconnected elements. Stale HMR elements
  // remain disconnected even after rAF and are naturally skipped.
  createEffect(() => {
    const rawAnchor: Measurable | null = local.virtualRef || ref() || null;

    // When asChild is used with Collection.ItemSlot wrappers, the resolved child
    // may be a <span style="display: contents"> which has zero bounding rect.
    // Floating UI needs an element with actual layout dimensions, so we traverse
    // into `display: contents` wrappers to find the first child with layout.
    const resolveAnchor = (el: Measurable | null): Measurable | null => {
      if (el && el instanceof HTMLElement && el.isConnected) {
        let current: HTMLElement | null = el;
        while (current && getComputedStyle(current).display === "contents") {
          current = current.firstElementChild as HTMLElement | null;
        }
        return current || el;
      }
      return el;
    };

    const anchor = resolveAnchor(rawAnchor);

    if (anchor && anchor instanceof Element && !anchor.isConnected) {
      // Element not connected yet — defer to allow DOM insertion to complete
      const frame = requestAnimationFrame(() => {
        const resolved = resolveAnchor(rawAnchor);
        if (
          resolved &&
          (!(resolved instanceof Element) || resolved.isConnected)
        ) {
          context.onAnchorChange(resolved);
        }
      });
      onCleanup(() => cancelAnimationFrame(frame));
      return;
    }
    context.onAnchorChange(anchor);
  });

  if (local.virtualRef) return null;
  return (
    <Primitive.div
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) => {
        setRef(el as HTMLDivElement);
      })}
    />
  );
}

interface PopperContentContextValue {
  placedSide: Side;
  onArrowChange(arrow: HTMLSpanElement | null): void;
  arrowX?: number;
  arrowY?: number;
  shouldHideArrow: boolean;
}

const [PopperContentProvider, useContentContext] =
  createPopperContext<PopperContentContextValue>("PopperContent");

interface PopperContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
  arrowPadding?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Element | Element[] | null;
  collisionPadding?: number | Partial<Record<Side, number>>;
  sticky?: "partial" | "always";
  hideWhenDetached?: boolean;
  updatePositionStrategy?: "optimized" | "always";
  onPlaced?: () => void;
  ref?: (el: HTMLElement) => void;
}

function PopperContent(inProps: ScopedProps<PopperContentProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopePopper",
    "side",
    "sideOffset",
    "align",
    "alignOffset",
    "arrowPadding",
    "avoidCollisions",
    "collisionBoundary",
    "collisionPadding",
    "sticky",
    "hideWhenDetached",
    "updatePositionStrategy",
    "onPlaced",
    "ref",
  ]);

  const context = usePopperContext("PopperContent", local.__scopePopper);
  const presenceCtx = usePresenceContext();
  const [content, setContent] = createSignal<HTMLDivElement | null>(null);
  const [floatingEl, setFloatingEl] = createSignal<HTMLDivElement | null>(null);
  const [contentZIndex, setContentZIndex] = createSignal<string | undefined>(
    undefined
  );
  const [arrowEl, setArrow] = createSignal<HTMLSpanElement | null>(null);
  const [placement, setPlacement] = createSignal<Placement>("bottom");
  const [isPositioned, setIsPositioned] = createSignal(false);
  const [arrowData, setArrowData] = createSignal<{
    x?: number;
    y?: number;
    centerOffset?: number;
  }>({});
  const [referenceHidden, setReferenceHidden] = createSignal(false);

  const arrowSize = createElementSize(() => arrowEl());
  const arrowHeight = () => arrowSize()?.height ?? 0;

  const side = () => local.side ?? "bottom";
  const sideOffset = () => local.sideOffset ?? 0;
  const align = () => local.align ?? "center";
  const alignOffset = () => local.alignOffset ?? 0;
  const arrowPadding = () => local.arrowPadding ?? 0;
  const avoidCollisions = () => local.avoidCollisions ?? true;

  const desiredPlacement = (): Placement => {
    const a = align();
    return (side() + (a !== "center" ? "-" + a : "")) as Placement;
  };

  // Position calculation
  createEffect(() => {
    const reference = context.anchor;
    const floating = floatingEl();
    if (!reference || !floating) return;

    // Skip if reference is a disconnected DOM element (e.g. stale HMR instance)
    if (reference instanceof Element && !reference.isConnected) return;

    const arrow = arrowEl();
    const collisionPaddingProp = local.collisionPadding ?? 0;
    const collisionPadding =
      typeof collisionPaddingProp === "number"
        ? collisionPaddingProp
        : { top: 0, right: 0, bottom: 0, left: 0, ...collisionPaddingProp };

    const boundary = Array.isArray(local.collisionBoundary)
      ? local.collisionBoundary
      : [local.collisionBoundary];
    const detectOverflowOptions = {
      padding: collisionPadding,
      boundary: boundary.filter(
        (b): b is Element => b !== null && b !== undefined
      ),
      altBoundary:
        boundary.filter((b): b is Element => b !== null && b !== undefined)
          .length > 0,
    };

    const middleware: Middleware[] = [
      offset({
        mainAxis: sideOffset() + arrowHeight(),
        alignmentAxis: alignOffset(),
      }),
    ];
    if (avoidCollisions()) {
      middleware.push(
        shift({
          mainAxis: true,
          crossAxis: false,
          limiter: local.sticky === "partial" ? limitShift() : undefined,
          ...detectOverflowOptions,
        })
      );
      middleware.push(flip({ ...detectOverflowOptions }));
    }
    middleware.push(
      sizeMiddleware({
        ...detectOverflowOptions,
        apply: ({ availableWidth, availableHeight, rects }) => {
          if (floating) {
            floating.style.setProperty(
              "--radix-popper-available-width",
              `${availableWidth}px`
            );
            floating.style.setProperty(
              "--radix-popper-available-height",
              `${availableHeight}px`
            );
            floating.style.setProperty(
              "--radix-popper-anchor-width",
              `${rects.reference.width}px`
            );
            floating.style.setProperty(
              "--radix-popper-anchor-height",
              `${rects.reference.height}px`
            );
          }
        },
      })
    );
    if (arrow)
      middleware.push(
        floatingUIarrow({ element: arrow, padding: arrowPadding() })
      );
    if (local.hideWhenDetached)
      middleware.push(
        hide({ strategy: "referenceHidden", ...detectOverflowOptions })
      );

    const cleanup = autoUpdate(
      reference as Element,
      floating,
      () => {
        computePosition(reference as Element, floating, {
          strategy: "fixed",
          placement: desiredPlacement(),
          middleware,
        }).then((data) => {
          floating.style.left = `${data.x}px`;
          floating.style.top = `${data.y}px`;
          setPlacement(data.placement);
          setArrowData(data.middlewareData.arrow ?? {});
          setReferenceHidden(!!data.middlewareData.hide?.referenceHidden);
          setIsPositioned(true);
          local.onPlaced?.();
        });
      },
      { animationFrame: local.updatePositionStrategy === "always" }
    );

    onCleanup(cleanup);
  });

  const placedSide = createMemo((): Side => {
    const [s] = placement().split("-");
    return s as Side;
  });
  const placedAlign = createMemo((): Align => {
    const [, a = "center"] = placement().split("-");
    return a as Align;
  });

  // Propagate z-index from content to wrapper so the wrapper's stacking context
  // doesn't trap the content behind higher stacking contexts on the page.
  createEffect(() => {
    const contentEl = content();
    if (contentEl) {
      setContentZIndex(window.getComputedStyle(contentEl).zIndex);
    }
  });

  return (
    <div
      ref={(el) => setFloatingEl(el)}
      data-radix-popper-content-wrapper=""
      style={{
        position: "fixed",
        "min-width": "max-content",
        "z-index": contentZIndex(),
        transform: isPositioned() ? undefined : "translate(0, -200%)",
        ...(referenceHidden()
          ? { visibility: "hidden", "pointer-events": "none" }
          : {}),
      }}
      dir={rest.dir}
    >
      <PopperContentProvider
        scope={local.__scopePopper}
        placedSide={placedSide()}
        onArrowChange={(el) => setArrow(el)}
        arrowX={arrowData().x}
        arrowY={arrowData().y}
        shouldHideArrow={(arrowData().centerOffset ?? 0) !== 0}
      >
        <Primitive.div
          data-side={placedSide()}
          data-align={placedAlign()}
          {...rest}
          ref={mergeRefs(local.ref, (el: HTMLElement) => {
            setContent(el as HTMLDivElement);
            // Register with the nearest Presence ancestor for exit animation tracking
            presenceCtx?.registerNode(el);
          })}
          style={{
            ...(typeof rest.style === "object" ? rest.style : {}),
            animation: !isPositioned() ? "none" : undefined,
          }}
        />
      </PopperContentProvider>
    </div>
  );
}

const OPPOSITE_SIDE: Record<Side, Side> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

interface PopperArrowProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  ref?: (el: SVGSVGElement) => void;
}

function PopperArrow(inProps: ScopedProps<PopperArrowProps>) {
  const [local, rest] = splitProps(inProps, ["__scopePopper", "ref"]);
  const contentContext = useContentContext("PopperArrow", local.__scopePopper);
  const baseSide = () => OPPOSITE_SIDE[contentContext.placedSide];

  // NOTE: SolidJS style objects don't track dynamic property keys reactively.
  // Instead of `[baseSide()]: '0'`, we explicitly set all four side properties
  // so that changes to `placedSide` are properly reflected.
  return (
    <span
      ref={(el) => contentContext.onArrowChange(el)}
      style={{
        position: "absolute",
        left:
          baseSide() === "left"
            ? "0"
            : contentContext.arrowX !== undefined
              ? `${contentContext.arrowX}px`
              : undefined,
        top:
          baseSide() === "top"
            ? "0"
            : contentContext.arrowY !== undefined
              ? `${contentContext.arrowY}px`
              : undefined,
        right: baseSide() === "right" ? "0" : undefined,
        bottom: baseSide() === "bottom" ? "0" : undefined,
        "transform-origin": (
          {
            top: "",
            right: "0 0",
            bottom: "center 0",
            left: "100% 0",
          } as Record<string, string>
        )[contentContext.placedSide],
        transform: (
          {
            top: "translateY(100%)",
            right: "translateY(50%) rotate(90deg) translateX(-50%)",
            bottom: "rotate(180deg)",
            left: "translateY(50%) rotate(-90deg) translateX(50%)",
          } as Record<string, string>
        )[contentContext.placedSide],
        visibility: contentContext.shouldHideArrow ? "hidden" : undefined,
      }}
    >
      <ArrowPrimitive
        {...rest}
        ref={local.ref}
        style={{
          display: "block",
          ...(typeof rest.style === "object" ? rest.style : {}),
        }}
      />
    </span>
  );
}

export {
  createPopperScope,
  Popper,
  PopperAnchor,
  PopperContent,
  PopperArrow,
  SIDE_OPTIONS,
  ALIGN_OPTIONS,
};
export type {
  PopperProps,
  PopperAnchorProps,
  PopperContentProps,
  PopperArrowProps,
};
