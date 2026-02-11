import { type JSX, splitProps, createSignal } from 'solid-js';
import { createContextScope, type Scope } from '@radix-solid/context';
import { mergeRefs } from '@radix-solid/compose-refs';
import { composeEventHandlers } from '@radix-solid/primitive';
import * as DialogPrimitive from '@radix-solid/dialog';
import { createDialogScope } from '@radix-solid/dialog';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog
 * -----------------------------------------------------------------------------------------------*/

const ROOT_NAME = 'AlertDialog';

type ScopedProps<P> = P & { __scopeAlertDialog?: Scope };
const [createAlertDialogContext, createAlertDialogScope] = createContextScope(ROOT_NAME, [
  createDialogScope,
]);
const useDialogScope = createDialogScope();

type DialogProps = DialogPrimitive.DialogProps;
interface AlertDialogProps extends Omit<DialogProps, 'modal'> {}

function AlertDialog(props: ScopedProps<AlertDialogProps>) {
  const [local, rest] = splitProps(props, ['__scopeAlertDialog']);
  const dialogScope = useDialogScope(local.__scopeAlertDialog);
  return <DialogPrimitive.Dialog {...dialogScope} {...rest} modal={true} />;
}

AlertDialog.displayName = ROOT_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'AlertDialogTrigger';

interface AlertDialogTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function AlertDialogTrigger(inProps: ScopedProps<AlertDialogTriggerProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeAlertDialog', 'ref']);
  const dialogScope = useDialogScope(local.__scopeAlertDialog);
  return <DialogPrimitive.DialogTrigger {...dialogScope} {...rest} ref={local.ref} />;
}

AlertDialogTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'AlertDialogPortal';

interface AlertDialogPortalProps extends DialogPrimitive.DialogPortalProps {}

function AlertDialogPortal(props: ScopedProps<AlertDialogPortalProps>) {
  const [local, rest] = splitProps(props, ['__scopeAlertDialog']);
  const dialogScope = useDialogScope(local.__scopeAlertDialog);
  return <DialogPrimitive.DialogPortal {...dialogScope} {...rest} />;
}

AlertDialogPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogOverlay
 * -----------------------------------------------------------------------------------------------*/

const OVERLAY_NAME = 'AlertDialogOverlay';

interface AlertDialogOverlayProps extends JSX.HTMLAttributes<HTMLDivElement> {
  forceMount?: true;
  ref?: (el: HTMLElement) => void;
}

function AlertDialogOverlay(inProps: ScopedProps<AlertDialogOverlayProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeAlertDialog', 'ref']);
  const dialogScope = useDialogScope(local.__scopeAlertDialog);
  return <DialogPrimitive.DialogOverlay {...dialogScope} {...rest} ref={local.ref} />;
}

AlertDialogOverlay.displayName = OVERLAY_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'AlertDialogContent';

type AlertDialogContentContextValue = {
  cancelRef: HTMLButtonElement | null;
  onCancelRefChange: (el: HTMLButtonElement | null) => void;
};

const [AlertDialogContentProvider, useAlertDialogContentContext] =
  createAlertDialogContext<AlertDialogContentContextValue>(CONTENT_NAME);

type DialogContentProps = DialogPrimitive.DialogContentProps;
interface AlertDialogContentProps
  extends Omit<DialogContentProps, 'onPointerDownOutside' | 'onInteractOutside'> {
  ref?: (el: HTMLElement) => void;
}

function AlertDialogContent(inProps: ScopedProps<AlertDialogContentProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeAlertDialog',
    'ref',
    'children',
    'onOpenAutoFocus',
  ]);
  const dialogScope = useDialogScope(local.__scopeAlertDialog);
  const [cancelRef, setCancelRef] = createSignal<HTMLButtonElement | null>(null);

  return (
    <AlertDialogContentProvider
      scope={local.__scopeAlertDialog}
      cancelRef={cancelRef()}
      onCancelRefChange={setCancelRef}
    >
      <DialogPrimitive.DialogContent
        role="alertdialog"
        {...dialogScope}
        {...rest}
        ref={local.ref}
        onOpenAutoFocus={composeEventHandlers(local.onOpenAutoFocus, (event: Event) => {
          event.preventDefault();
          cancelRef()?.focus({ preventScroll: true });
        })}
        onPointerDownOutside={(event: any) => event.preventDefault()}
        onInteractOutside={(event: any) => event.preventDefault()}
      >
        {local.children}
      </DialogPrimitive.DialogContent>
    </AlertDialogContentProvider>
  );
}

AlertDialogContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogTitle
 * -----------------------------------------------------------------------------------------------*/

const TITLE_NAME = 'AlertDialogTitle';

interface AlertDialogTitleProps extends JSX.HTMLAttributes<HTMLHeadingElement> {
  ref?: (el: HTMLElement) => void;
}

function AlertDialogTitle(inProps: ScopedProps<AlertDialogTitleProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeAlertDialog', 'ref']);
  const dialogScope = useDialogScope(local.__scopeAlertDialog);
  return <DialogPrimitive.DialogTitle {...dialogScope} {...rest} ref={local.ref} />;
}

AlertDialogTitle.displayName = TITLE_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogDescription
 * -----------------------------------------------------------------------------------------------*/

const DESCRIPTION_NAME = 'AlertDialogDescription';

interface AlertDialogDescriptionProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  ref?: (el: HTMLElement) => void;
}

function AlertDialogDescription(inProps: ScopedProps<AlertDialogDescriptionProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeAlertDialog', 'ref']);
  const dialogScope = useDialogScope(local.__scopeAlertDialog);
  return <DialogPrimitive.DialogDescription {...dialogScope} {...rest} ref={local.ref} />;
}

AlertDialogDescription.displayName = DESCRIPTION_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogAction
 * -----------------------------------------------------------------------------------------------*/

const ACTION_NAME = 'AlertDialogAction';

interface AlertDialogActionProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function AlertDialogAction(inProps: ScopedProps<AlertDialogActionProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeAlertDialog', 'ref']);
  const dialogScope = useDialogScope(local.__scopeAlertDialog);
  return <DialogPrimitive.DialogClose {...dialogScope} {...rest} ref={local.ref} />;
}

AlertDialogAction.displayName = ACTION_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogCancel
 * -----------------------------------------------------------------------------------------------*/

const CANCEL_NAME = 'AlertDialogCancel';

interface AlertDialogCancelProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: (el: HTMLElement) => void;
}

function AlertDialogCancel(inProps: ScopedProps<AlertDialogCancelProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeAlertDialog', 'ref']);
  const { onCancelRefChange } = useAlertDialogContentContext(CANCEL_NAME, local.__scopeAlertDialog);
  const dialogScope = useDialogScope(local.__scopeAlertDialog);
  return (
    <DialogPrimitive.DialogClose
      {...dialogScope}
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) => onCancelRefChange(el as HTMLButtonElement))}
    />
  );
}

AlertDialogCancel.displayName = CANCEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = AlertDialog;
const Trigger = AlertDialogTrigger;
const Portal = AlertDialogPortal;
const Overlay = AlertDialogOverlay;
const Content = AlertDialogContent;
const Action = AlertDialogAction;
const Cancel = AlertDialogCancel;
const Title = AlertDialogTitle;
const Description = AlertDialogDescription;

export {
  createAlertDialogScope,
  //
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTitle,
  AlertDialogDescription,
  //
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Action,
  Cancel,
  Title,
  Description,
};
export type {
  AlertDialogProps,
  AlertDialogTriggerProps,
  AlertDialogPortalProps,
  AlertDialogOverlayProps,
  AlertDialogContentProps,
  AlertDialogActionProps,
  AlertDialogCancelProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
};
