import {
  type JSX,
  createSignal,
  createEffect,
  onCleanup,
  splitProps,
  Show,
} from "solid-js";
import { composeEventHandlers } from "@radix-solid-js/primitive";
import { mergeRefs } from "@radix-solid-js/compose-refs";
import { createContextScope, type Scope } from "@radix-solid-js/context";
import { DismissableLayer } from "@radix-solid-js/dismissable-layer";
import { useFocusGuards } from "@radix-solid-js/focus-guards";
import { FocusScope } from "@radix-solid-js/focus-scope";
import { createId } from "@radix-solid-js/id";
import { Portal as PortalPrimitive } from "@radix-solid-js/portal";
import { Presence, usePresenceContext } from "@radix-solid-js/presence";
import { Primitive } from "@radix-solid-js/primitive-component";
import { createControllableSignal } from "@radix-solid-js/use-controllable-state";
import { hideOthers } from "aria-hidden";

/* -------------------------------------------------------------------------------------------------
 * Dialog
 * -----------------------------------------------------------------------------------------------*/

const DIALOG_NAME = "Dialog";

type ScopedProps<P> = P & { __scopeDialog?: Scope };
const [createDialogContext, createDialogScope] =
  createContextScope(DIALOG_NAME);

type DialogContextValue = {
  triggerRef: HTMLButtonElement | null;
  onTriggerRefChange: (el: HTMLButtonElement | null) => void;
  contentRef: HTMLDivElement | null;
  onContentRefChange: (el: HTMLDivElement | null) => void;
  contentId: string;
  titleId: string;
  descriptionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenToggle: () => void;
  modal: boolean;
};

const [DialogProvider, useDialogContext] =
  createDialogContext<DialogContextValue>(DIALOG_NAME);

interface DialogProps {
  children?: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

function Dialog(props: ScopedProps<DialogProps>) {
  const [local] = splitProps(props, [
    "__scopeDialog",
    "children",
    "open",
    "defaultOpen",
    "onOpenChange",
    "modal",
  ]);

  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement | null>(
    null
  );
  const [contentRef, setContentRef] = createSignal<HTMLDivElement | null>(null);
  const contentId = createId();
  const titleId = createId();
  const descriptionId = createId();

  const [open, setOpen] = createControllableSignal({
    prop: () => local.open,
    defaultProp: local.defaultOpen ?? false,
    onChange: (value) => local.onOpenChange?.(value),
  });

  const modal = () => local.modal ?? true;

  return (
    <DialogProvider
      scope={local.__scopeDialog}
      triggerRef={triggerRef()}
      onTriggerRefChange={setTriggerRef}
      contentRef={contentRef()}
      onContentRefChange={setContentRef}
      contentId={contentId}
      titleId={titleId}
      descriptionId={descriptionId}
      open={open()}
      onOpenChange={setOpen}
      onOpenToggle={() => setOpen((prev) => !prev)}
      modal={modal()}
    >
      {local.children}
    </DialogProvider>
  );
}

Dialog.displayName = DIALOG_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "DialogTrigger";

interface DialogTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function DialogTrigger(inProps: ScopedProps<DialogTriggerProps>) {
  const [local, rest] = splitProps(inProps, ["__scopeDialog", "ref"]);
  const context = useDialogContext(TRIGGER_NAME, local.__scopeDialog);

  return (
    <Primitive.button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={context.open}
      aria-controls={context.contentId}
      data-state={getState(context.open)}
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) =>
        context.onTriggerRefChange(el as HTMLButtonElement)
      )}
      onClick={composeEventHandlers(rest.onClick as any, context.onOpenToggle)}
    />
  );
}

DialogTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "DialogPortal";

type PortalContextValue = { forceMount?: true };
const [PortalProvider, usePortalContext] =
  createDialogContext<PortalContextValue>(PORTAL_NAME, {
    forceMount: undefined,
  });

interface DialogPortalProps {
  children?: JSX.Element;
  container?: Element | DocumentFragment | null;
  forceMount?: true;
}

function DialogPortal(props: ScopedProps<DialogPortalProps>) {
  const [local] = splitProps(props, [
    "__scopeDialog",
    "forceMount",
    "children",
    "container",
  ]);

  // Portal is always mounted — visibility is controlled by Presence in
  // DialogContent and DialogOverlay individually. This avoids the dual-Presence
  // problem where an outer Presence would unmount the portal immediately,
  // preventing inner exit animations from completing.
  return (
    <PortalProvider scope={local.__scopeDialog} forceMount={local.forceMount}>
      <PortalPrimitive container={local.container}>
        {local.children}
      </PortalPrimitive>
    </PortalProvider>
  );
}

DialogPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogOverlay
 * -----------------------------------------------------------------------------------------------*/

const OVERLAY_NAME = "DialogOverlay";

interface DialogOverlayProps extends JSX.HTMLAttributes<HTMLDivElement> {
  forceMount?: true;
  ref?: (el: HTMLElement) => void;
}

function DialogOverlay(inProps: ScopedProps<DialogOverlayProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeDialog",
    "forceMount",
    "ref",
  ]);
  const portalContext = usePortalContext(OVERLAY_NAME, local.__scopeDialog);
  const context = useDialogContext(OVERLAY_NAME, local.__scopeDialog);
  const forceMount = () => local.forceMount ?? portalContext.forceMount;

  return (
    <Show when={context.modal}>
      <Presence present={forceMount() || context.open}>
        <DialogOverlayImpl
          {...rest}
          ref={local.ref}
          __scopeDialog={local.__scopeDialog}
        />
      </Presence>
    </Show>
  );
}

DialogOverlay.displayName = OVERLAY_NAME;

function DialogOverlayImpl(
  inProps: ScopedProps<
    JSX.HTMLAttributes<HTMLDivElement> & { ref?: (el: HTMLElement) => void }
  >
) {
  const [local, rest] = splitProps(inProps, ["__scopeDialog", "ref", "style"]);
  const context = useDialogContext(OVERLAY_NAME, local.__scopeDialog);
  const presenceCtx = usePresenceContext();

  return (
    <Primitive.div
      data-state={getState(context.open)}
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) => {
        presenceCtx?.registerNode(el);
      })}
      style={{
        "pointer-events": "auto",
        ...(typeof local.style === "object" ? local.style : {}),
      }}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "DialogContent";

interface DialogContentProps extends Omit<
  DialogContentImplProps,
  "trapFocus" | "disableOutsidePointerEvents"
> {
  forceMount?: true;
}

function DialogContent(inProps: ScopedProps<DialogContentProps>) {
  const [local, rest] = splitProps(inProps, ["__scopeDialog", "forceMount"]);
  const portalContext = usePortalContext(CONTENT_NAME, local.__scopeDialog);
  const context = useDialogContext(CONTENT_NAME, local.__scopeDialog);
  const forceMount = () => local.forceMount ?? portalContext.forceMount;

  return (
    <Presence present={forceMount() || context.open}>
      <Show
        when={context.modal}
        fallback={
          <DialogContentNonModal
            {...rest}
            __scopeDialog={local.__scopeDialog}
          />
        }
      >
        <DialogContentModal {...rest} __scopeDialog={local.__scopeDialog} />
      </Show>
    </Presence>
  );
}

DialogContent.displayName = CONTENT_NAME;

/* -----------------------------------------------------------------------------------------------*/

interface DialogContentTypeProps extends Omit<
  DialogContentImplProps,
  "trapFocus" | "disableOutsidePointerEvents"
> {}

function DialogContentModal(inProps: ScopedProps<DialogContentTypeProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeDialog",
    "ref",
    "onCloseAutoFocus",
    "onPointerDownOutside",
    "onFocusOutside",
  ]);
  const context = useDialogContext(CONTENT_NAME, local.__scopeDialog);
  let contentRef: HTMLDivElement | undefined;

  // aria-hide everything except the content
  createEffect(() => {
    if (contentRef) {
      const cleanup = hideOthers(contentRef);
      onCleanup(() => cleanup?.());
    }
  });

  // Prevent body scroll when modal dialog is open
  createEffect(() => {
    if (context.open) {
      const body = document.body;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      const originalOverflow = body.style.overflow;
      const originalPaddingRight = body.style.paddingRight;

      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }

      onCleanup(() => {
        body.style.overflow = originalOverflow;
        body.style.paddingRight = originalPaddingRight;
      });
    }
  });

  return (
    <DialogContentImpl
      {...rest}
      __scopeDialog={local.__scopeDialog}
      ref={mergeRefs(local.ref, (el: HTMLElement) => {
        contentRef = el as HTMLDivElement;
        context.onContentRefChange(el as HTMLDivElement);
      })}
      trapFocus={context.open}
      disableOutsidePointerEvents
      onCloseAutoFocus={composeEventHandlers(
        local.onCloseAutoFocus,
        (event: Event) => {
          event.preventDefault();
          context.triggerRef?.focus();
        }
      )}
      onPointerDownOutside={composeEventHandlers(
        local.onPointerDownOutside,
        (event: any) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick =
            originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (isRightClick) event.preventDefault();
        }
      )}
      onFocusOutside={composeEventHandlers(
        local.onFocusOutside,
        (event: Event) => event.preventDefault()
      )}
    />
  );
}

/* -----------------------------------------------------------------------------------------------*/

function DialogContentNonModal(inProps: ScopedProps<DialogContentTypeProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeDialog",
    "onCloseAutoFocus",
    "onInteractOutside",
  ]);
  const context = useDialogContext(CONTENT_NAME, local.__scopeDialog);
  let hasInteractedOutside = false;
  let hasPointerDownOutside = false;

  return (
    <DialogContentImpl
      {...rest}
      __scopeDialog={local.__scopeDialog}
      trapFocus={false}
      disableOutsidePointerEvents={false}
      onCloseAutoFocus={(event: Event) => {
        local.onCloseAutoFocus?.(event);
        if (!event.defaultPrevented) {
          if (!hasInteractedOutside) context.triggerRef?.focus();
          event.preventDefault();
        }
        hasInteractedOutside = false;
        hasPointerDownOutside = false;
      }}
      onInteractOutside={(event: any) => {
        local.onInteractOutside?.(event);
        if (!event.defaultPrevented) {
          hasInteractedOutside = true;
          if (event.detail.originalEvent.type === "pointerdown") {
            hasPointerDownOutside = true;
          }
        }
        const target = event.target as HTMLElement;
        const targetIsTrigger = context.triggerRef?.contains(target);
        if (targetIsTrigger) event.preventDefault();
        if (
          event.detail.originalEvent.type === "focusin" &&
          hasPointerDownOutside
        ) {
          event.preventDefault();
        }
      }}
    />
  );
}

/* -----------------------------------------------------------------------------------------------*/

interface DialogContentImplProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
  trapFocus?: boolean;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
  disableOutsidePointerEvents?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: any) => void;
  onFocusOutside?: (event: any) => void;
  onInteractOutside?: (event: any) => void;
}

function DialogContentImpl(inProps: ScopedProps<DialogContentImplProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeDialog",
    "ref",
    "trapFocus",
    "onOpenAutoFocus",
    "onCloseAutoFocus",
    "disableOutsidePointerEvents",
    "onEscapeKeyDown",
    "onPointerDownOutside",
    "onFocusOutside",
    "onInteractOutside",
  ]);
  const context = useDialogContext(CONTENT_NAME, local.__scopeDialog);

  // Make sure the whole tree has focus guards
  useFocusGuards();

  return (
    <>
      <FocusScope
        loop
        trapped={local.trapFocus}
        onMountAutoFocus={local.onOpenAutoFocus}
        onUnmountAutoFocus={local.onCloseAutoFocus}
      >
        <DismissableLayer
          role="dialog"
          id={context.contentId}
          aria-describedby={context.descriptionId}
          aria-labelledby={context.titleId}
          data-state={getState(context.open)}
          {...rest}
          ref={local.ref}
          disableOutsidePointerEvents={local.disableOutsidePointerEvents}
          onEscapeKeyDown={local.onEscapeKeyDown}
          onPointerDownOutside={local.onPointerDownOutside}
          onFocusOutside={local.onFocusOutside}
          onInteractOutside={local.onInteractOutside}
          onDismiss={() => context.onOpenChange(false)}
        />
      </FocusScope>
    </>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DialogTitle
 * -----------------------------------------------------------------------------------------------*/

const TITLE_NAME = "DialogTitle";

interface DialogTitleProps extends JSX.HTMLAttributes<HTMLHeadingElement> {
  ref?: (el: HTMLElement) => void;
}

function DialogTitle(inProps: ScopedProps<DialogTitleProps>) {
  const [local, rest] = splitProps(inProps, ["__scopeDialog", "ref"]);
  const context = useDialogContext(TITLE_NAME, local.__scopeDialog);
  return <Primitive.h2 id={context.titleId} {...rest} ref={local.ref} />;
}

DialogTitle.displayName = TITLE_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogDescription
 * -----------------------------------------------------------------------------------------------*/

const DESCRIPTION_NAME = "DialogDescription";

interface DialogDescriptionProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  ref?: (el: HTMLElement) => void;
}

function DialogDescription(inProps: ScopedProps<DialogDescriptionProps>) {
  const [local, rest] = splitProps(inProps, ["__scopeDialog", "ref"]);
  const context = useDialogContext(DESCRIPTION_NAME, local.__scopeDialog);
  return <Primitive.p id={context.descriptionId} {...rest} ref={local.ref} />;
}

DialogDescription.displayName = DESCRIPTION_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogClose
 * -----------------------------------------------------------------------------------------------*/

const CLOSE_NAME = "DialogClose";

interface DialogCloseProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function DialogClose(inProps: ScopedProps<DialogCloseProps>) {
  const [local, rest] = splitProps(inProps, ["__scopeDialog", "ref"]);
  const context = useDialogContext(CLOSE_NAME, local.__scopeDialog);

  return (
    <Primitive.button
      type="button"
      {...rest}
      ref={local.ref}
      onClick={composeEventHandlers(rest.onClick as any, () =>
        context.onOpenChange(false)
      )}
    />
  );
}

DialogClose.displayName = CLOSE_NAME;

/* -----------------------------------------------------------------------------------------------*/

function getState(open: boolean) {
  return open ? "open" : "closed";
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = Dialog;
const Trigger = DialogTrigger;
const PortalExport = DialogPortal;
const Overlay = DialogOverlay;
const Content = DialogContent;
const Title = DialogTitle;
const Description = DialogDescription;
const Close = DialogClose;

export {
  createDialogScope,
  //
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  //
  Root,
  Trigger,
  PortalExport as Portal,
  Overlay,
  Content,
  Title,
  Description,
  Close,
};
export type {
  DialogProps,
  DialogTriggerProps,
  DialogPortalProps,
  DialogOverlayProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
};
