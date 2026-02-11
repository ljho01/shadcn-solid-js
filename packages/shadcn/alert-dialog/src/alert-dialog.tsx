import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as AlertDialogPrimitive from "@radix-solid-js/alert-dialog";
import { buttonVariants } from "@shadcn-solid-js/button";
import { cn } from "@shadcn-solid-js/utils";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay: Component<
  ComponentProps<typeof AlertDialogPrimitive.Overlay>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      class={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs",
        local.class
      )}
      {...rest}
    />
  );
};

interface AlertDialogContentProps extends ComponentProps<
  typeof AlertDialogPrimitive.Content
> {
  class?: string;
  children?: JSX.Element;
  size?: "default" | "sm";
}

const AlertDialogContent: Component<AlertDialogContentProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "size"]);
  const size = () => local.size ?? "default";
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size()}
        class={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-background ring-foreground/10 group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl p-4 ring-1 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm",
          local.class
        )}
        {...rest}
      >
        {local.children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
};

const AlertDialogHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="alert-dialog-header"
      class={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        local.class
      )}
      {...rest}
    />
  );
};

const AlertDialogFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="alert-dialog-footer"
      class={cn(
        "bg-muted/50 -mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t p-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        local.class
      )}
      {...rest}
    />
  );
};

const AlertDialogTitle: Component<
  ComponentProps<typeof AlertDialogPrimitive.Title>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      class={cn(
        "text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        local.class
      )}
      {...rest}
    />
  );
};

const AlertDialogDescription: Component<
  ComponentProps<typeof AlertDialogPrimitive.Description>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      class={cn(
        "text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3",
        local.class
      )}
      {...rest}
    />
  );
};

const AlertDialogMedia: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="alert-dialog-media"
      class={cn(
        "bg-muted mb-2 inline-flex size-10 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        local.class
      )}
      {...rest}
    />
  );
};

interface AlertDialogActionProps extends ComponentProps<
  typeof AlertDialogPrimitive.Action
> {
  class?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon";
}

const AlertDialogAction: Component<AlertDialogActionProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "variant", "size"]);
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      class={cn(
        buttonVariants({
          variant: local.variant ?? "default",
          size: local.size ?? "default",
        }),
        local.class
      )}
      {...rest}
    />
  );
};

interface AlertDialogCancelProps extends ComponentProps<
  typeof AlertDialogPrimitive.Cancel
> {
  class?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon";
}

const AlertDialogCancel: Component<AlertDialogCancelProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "variant", "size"]);
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      class={cn(
        buttonVariants({
          variant: local.variant ?? "outline",
          size: local.size ?? "default",
        }),
        local.class
      )}
      {...rest}
    />
  );
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogMedia,
  AlertDialogAction,
  AlertDialogCancel,
};
export type {
  AlertDialogContentProps,
  AlertDialogActionProps,
  AlertDialogCancelProps,
};
