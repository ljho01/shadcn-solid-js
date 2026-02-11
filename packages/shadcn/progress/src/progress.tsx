import { type Component, type ComponentProps, splitProps } from "solid-js";
import * as ProgressPrimitive from "@radix-solid/progress";
import { cn } from "@shadcn-solid/utils";

const Progress: Component<ComponentProps<typeof ProgressPrimitive.Root>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class", "value"]);
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      class={cn(
        "bg-muted relative flex h-1 w-full items-center overflow-x-hidden rounded-full",
        local.class
      )}
      {...rest}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        class="bg-primary size-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (local.value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
};

export { Progress };
