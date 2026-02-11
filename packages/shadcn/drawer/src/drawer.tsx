import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as DialogPrimitive from "@radix-solid-js/dialog";
import { cn } from "@shadcn-solid-js/utils";

const Drawer = DialogPrimitive.Root;

const DrawerTrigger = DialogPrimitive.Trigger;

const DrawerPortal = DialogPrimitive.Portal;

const DrawerClose = DialogPrimitive.Close;

const DrawerOverlay: Component<
  ComponentProps<typeof DialogPrimitive.Overlay>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Overlay
      data-slot="drawer-overlay"
      class={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
        local.class
      )}
      {...rest}
    />
  );
};

const DrawerContent: Component<
  ComponentProps<typeof DialogPrimitive.Content> & { children?: JSX.Element }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        data-slot="drawer-content"
        class={cn(
          "bg-background group/drawer-content fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[80vh] flex-col text-sm rounded-t-xl border-t data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          local.class
        )}
        {...rest}
      >
        <div class="bg-muted mx-auto mt-4 h-1 w-[100px] shrink-0 rounded-full" />
        {local.children}
      </DialogPrimitive.Content>
    </DrawerPortal>
  );
};

const DrawerHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="drawer-header"
      class={cn(
        "flex flex-col gap-0.5 p-4 text-center md:gap-0.5 md:text-left",
        local.class
      )}
      {...rest}
    />
  );
};

const DrawerFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="drawer-footer"
      class={cn("mt-auto flex flex-col gap-2 p-4", local.class)}
      {...rest}
    />
  );
};

const DrawerTitle: Component<ComponentProps<typeof DialogPrimitive.Title>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      class={cn("text-foreground text-base font-medium", local.class)}
      {...rest}
    />
  );
};

const DrawerDescription: Component<
  ComponentProps<typeof DialogPrimitive.Description>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      class={cn("text-muted-foreground text-sm", local.class)}
      {...rest}
    />
  );
};

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
