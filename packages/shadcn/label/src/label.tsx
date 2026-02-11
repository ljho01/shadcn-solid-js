import { splitProps } from "solid-js";
import {
  Label as LabelPrimitive,
  type LabelProps as LabelPrimitiveProps,
} from "@radix-solid-js/label";
import { cn } from "@shadcn-solid-js/utils";

interface LabelProps extends LabelPrimitiveProps {
  class?: string;
}

function Label(props: LabelProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <LabelPrimitive
      data-slot="label"
      class={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        local.class
      )}
      {...rest}
    />
  );
}

export { Label };
export type { LabelProps };
