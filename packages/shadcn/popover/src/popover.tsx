import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as PopoverPrimitive from "@radix-solid-js/popover";
import { cn } from "@shadcn-solid-js/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent: Component<
  ComponentProps<typeof PopoverPrimitive.Content>
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "align", "sideOffset"]);
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={local.align ?? "center"}
        sideOffset={local.sideOffset ?? 4}
        class={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-2.5 rounded-lg p-2.5 text-sm shadow-md ring-1 outline-hidden duration-100",
          local.class
        )}
        {...rest}
      />
    </PopoverPrimitive.Portal>
  );
};

const PopoverHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="popover-header"
      class={cn("flex flex-col gap-0.5 text-sm", local.class)}
      {...rest}
    />
  );
};

const PopoverTitle: Component<JSX.HTMLAttributes<HTMLHeadingElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="popover-title"
      class={cn("font-medium", local.class)}
      {...rest}
    />
  );
};

const PopoverDescription: Component<
  JSX.HTMLAttributes<HTMLParagraphElement>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <p
      data-slot="popover-description"
      class={cn("text-muted-foreground", local.class)}
      {...rest}
    />
  );
};

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
};
