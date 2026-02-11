import { type Component, type ComponentProps, splitProps } from "solid-js";
import * as HoverCardPrimitive from "@radix-solid/hover-card";
import { cn } from "@shadcn-solid/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent: Component<
  ComponentProps<typeof HoverCardPrimitive.Content>
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "align", "sideOffset"]);
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={local.align ?? "center"}
        sideOffset={local.sideOffset ?? 4}
        class={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-lg p-2.5 text-sm shadow-md ring-1 outline-hidden duration-100",
          local.class
        )}
        {...rest}
      />
    </HoverCardPrimitive.Portal>
  );
};

export { HoverCard, HoverCardTrigger, HoverCardContent };
