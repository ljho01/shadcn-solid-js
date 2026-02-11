import { type JSX, createSignal, createEffect, splitProps } from "solid-js";
import { composeEventHandlers } from "@radix-solid-js/primitive";
import { mergeRefs } from "@radix-solid-js/compose-refs";
import { createContextScope } from "@radix-solid-js/context";
import { createControllableSignal } from "@radix-solid-js/use-controllable-state";
import { createId } from "@radix-solid-js/id";
import { Presence, usePresenceContext } from "@radix-solid-js/presence";
import {
  Primitive,
  type PrimitiveProps,
} from "@radix-solid-js/primitive-component";

import type { Scope } from "@radix-solid-js/context";

/* -------------------------------------------------------------------------------------------------
 * Collapsible
 * -----------------------------------------------------------------------------------------------*/

const COLLAPSIBLE_NAME = "Collapsible";

const [createCollapsibleContext, createCollapsibleScope] =
  createContextScope(COLLAPSIBLE_NAME);

type CollapsibleContextValue = {
  contentId: string;
  disabled?: boolean;
  open: boolean;
  onOpenToggle(): void;
};

const [CollapsibleProvider, useCollapsibleContext] =
  createCollapsibleContext<CollapsibleContextValue>(COLLAPSIBLE_NAME);

interface CollapsibleProps extends PrimitiveProps<"div"> {
  defaultOpen?: boolean;
  open?: boolean;
  disabled?: boolean;
  onOpenChange?(open: boolean): void;
  __scopeCollapsible?: Scope;
}

function Collapsible(props: CollapsibleProps) {
  const [local, rest] = splitProps(props, [
    "__scopeCollapsible",
    "open",
    "defaultOpen",
    "disabled",
    "onOpenChange",
  ]);

  const [open, setOpen] = createControllableSignal({
    prop: () => local.open,
    defaultProp: local.defaultOpen ?? false,
    onChange: local.onOpenChange,
    caller: COLLAPSIBLE_NAME,
  });

  const contentId = createId();

  return (
    <CollapsibleProvider
      scope={local.__scopeCollapsible}
      disabled={local.disabled}
      contentId={contentId}
      open={open()}
      onOpenToggle={() => setOpen((prev) => !prev)}
    >
      <Primitive.div
        data-state={getState(open())}
        data-disabled={local.disabled ? "" : undefined}
        {...rest}
      />
    </CollapsibleProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * CollapsibleTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "CollapsibleTrigger";

interface CollapsibleTriggerProps extends PrimitiveProps<"button"> {
  __scopeCollapsible?: Scope;
}

function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  const [local, rest] = splitProps(props, ["__scopeCollapsible", "onClick"]);
  const context = useCollapsibleContext(TRIGGER_NAME, local.__scopeCollapsible);

  return (
    <Primitive.button
      type="button"
      aria-controls={context.contentId}
      aria-expanded={context.open || false}
      data-state={getState(context.open)}
      data-disabled={context.disabled ? "" : undefined}
      disabled={context.disabled}
      {...rest}
      onClick={composeEventHandlers<MouseEvent>(
        local.onClick as any,
        context.onOpenToggle
      )}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * CollapsibleContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "CollapsibleContent";

interface CollapsibleContentProps extends PrimitiveProps<"div"> {
  forceMount?: true;
  __scopeCollapsible?: Scope;
}

function CollapsibleContent(props: CollapsibleContentProps) {
  const [local, rest] = splitProps(props, ["forceMount", "__scopeCollapsible"]);
  const context = useCollapsibleContext(CONTENT_NAME, local.__scopeCollapsible);

  return (
    <Presence present={local.forceMount || context.open}>
      <CollapsibleContentImpl
        {...rest}
        open={context.open}
        contentId={context.contentId}
        disabled={context.disabled}
      />
    </Presence>
  );
}

/* -----------------------------------------------------------------------------------------------*/

interface CollapsibleContentImplProps extends PrimitiveProps<"div"> {
  open: boolean;
  contentId: string;
  disabled?: boolean;
}

function CollapsibleContentImpl(props: CollapsibleContentImplProps) {
  const [local, rest] = splitProps(props, [
    "open",
    "contentId",
    "disabled",
    "ref",
    "style",
    "children",
  ]);

  const presenceCtx = usePresenceContext();
  let nodeRef: HTMLDivElement | undefined;
  const [height, setHeight] = createSignal<number>(0);
  const [width, setWidth] = createSignal<number>(0);
  let originalStyles: Record<string, string> | undefined;

  // Measure content dimensions on open state changes.
  // Uses createEffect which runs after DOM updates but before browser paint
  // (SolidJS effects run as microtasks). Temporarily disables animations to
  // measure the element's natural dimensions, then re-enables them so the
  // CSS animation can use the correct --radix-collapsible-content-height value.
  createEffect(() => {
    void local.open; // track this reactive prop
    const node = nodeRef;
    if (node) {
      originalStyles = originalStyles || {
        transitionDuration: node.style.transitionDuration,
        animationName: node.style.animationName,
      };

      // Temporarily disable animations to get accurate measurement
      node.style.transitionDuration = "0s";
      node.style.animationName = "none";

      const rect = node.getBoundingClientRect();
      setHeight(rect.height);
      setWidth(rect.width);

      // Re-enable animations so CSS keyframes can play
      node.style.transitionDuration = originalStyles.transitionDuration!;
      node.style.animationName = originalStyles.animationName!;
    }
  });

  return (
    <Primitive.div
      data-state={getState(local.open)}
      data-disabled={local.disabled ? "" : undefined}
      id={local.contentId}
      {...rest}
      ref={mergeRefs(local.ref, (el: any) => {
        nodeRef = el as HTMLDivElement;
        // Register with the nearest Presence ancestor so it can detect
        // exit animations and delay unmounting until they complete.
        presenceCtx?.registerNode(el);
      })}
      style={
        {
          "--radix-collapsible-content-height": height()
            ? `${height()}px`
            : undefined,
          "--radix-collapsible-content-width": width()
            ? `${width()}px`
            : undefined,
          ...(typeof local.style === "object" ? local.style : {}),
        } as JSX.CSSProperties
      }
    >
      {local.children}
    </Primitive.div>
  );
}

/* -----------------------------------------------------------------------------------------------*/

function getState(open?: boolean) {
  return open ? "open" : "closed";
}

const Root = Collapsible;
const Trigger = CollapsibleTrigger;
const Content = CollapsibleContent;

export {
  createCollapsibleScope,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Root,
  Trigger,
  Content,
};
export type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
};
