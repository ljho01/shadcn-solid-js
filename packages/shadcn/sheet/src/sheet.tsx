import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as DialogPrimitive from "@radix-solid/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shadcn-solid/utils";

const Sheet = DialogPrimitive.Root;

const SheetTrigger = DialogPrimitive.Trigger;

const SheetClose = DialogPrimitive.Close;

const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay: Component<
  ComponentProps<typeof DialogPrimitive.Overlay>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      class={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs",
        local.class
      )}
      {...rest}
    />
  );
};

const sheetContentVariants = cva(
  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed z-50 flex flex-col gap-4 bg-clip-padding text-sm shadow-lg transition duration-200 ease-in-out",
  {
    variants: {
      side: {
        top: "data-[state=closed]:slide-out-to-top-10 data-[state=open]:slide-in-from-top-10 inset-x-0 top-0 h-auto border-b",
        bottom:
          "data-[state=closed]:slide-out-to-bottom-10 data-[state=open]:slide-in-from-bottom-10 inset-x-0 bottom-0 h-auto border-t",
        left: "data-[state=closed]:slide-out-to-left-10 data-[state=open]:slide-in-from-left-10 inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        right:
          "data-[state=closed]:slide-out-to-right-10 data-[state=open]:slide-in-from-right-10 inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

interface SheetContentProps
  extends
    ComponentProps<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetContentVariants> {
  class?: string;
  children?: JSX.Element;
}

const SheetContent: Component<SheetContentProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "side"]);
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        class={cn(sheetContentVariants({ side: local.side }), local.class)}
        {...rest}
      >
        {local.children}
        <DialogPrimitive.Close class="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-3 right-3 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-4"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span class="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
};

const SheetHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sheet-header"
      class={cn("flex flex-col gap-0.5 p-4", local.class)}
      {...rest}
    />
  );
};

const SheetFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sheet-footer"
      class={cn("mt-auto flex flex-col gap-2 p-4", local.class)}
      {...rest}
    />
  );
};

const SheetTitle: Component<ComponentProps<typeof DialogPrimitive.Title>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      class={cn("text-foreground text-base font-medium", local.class)}
      {...rest}
    />
  );
};

const SheetDescription: Component<
  ComponentProps<typeof DialogPrimitive.Description>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      class={cn("text-muted-foreground text-sm", local.class)}
      {...rest}
    />
  );
};

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetContentVariants,
};
export type { SheetContentProps };
