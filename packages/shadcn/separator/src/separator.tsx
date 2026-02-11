import { splitProps } from "solid-js";
import {
  Separator as SeparatorPrimitive,
  type SeparatorProps as SeparatorPrimitiveProps,
} from "@radix-solid-js/separator";
import { cn } from "@shadcn-solid-js/utils";

interface SeparatorProps extends SeparatorPrimitiveProps {
  class?: string;
  orientation?: "horizontal" | "vertical";
}

function Separator(props: SeparatorProps) {
  const [local, rest] = splitProps(props, ["class", "orientation"]);

  const orientation = () => local.orientation ?? "horizontal";

  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation()}
      class={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        local.class
      )}
      {...rest}
    />
  );
}

export { Separator };
export type { SeparatorProps };
