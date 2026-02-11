import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as ScrollAreaPrimitive from "@radix-solid/scroll-area";
import { cn } from "@shadcn-solid/utils";

const ScrollArea: Component<
  ComponentProps<typeof ScrollAreaPrimitive.Root> & { children?: JSX.Element }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      class={cn("relative", local.class)}
      {...rest}
    >
      <ScrollAreaPrimitive.Viewport class="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1">
        {local.children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
};

const ScrollBar: Component<
  ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "orientation"]);
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-bar"
      orientation={local.orientation ?? "vertical"}
      class={cn(
        "flex touch-none p-px transition-colors select-none",
        (local.orientation ?? "vertical") === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        local.orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        local.class
      )}
      {...rest}
    >
      <ScrollAreaPrimitive.Thumb class="bg-border relative flex-1 rounded-full" />
    </ScrollAreaPrimitive.Scrollbar>
  );
};

export { ScrollArea, ScrollBar };
