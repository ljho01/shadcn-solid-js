import { type Component, type ComponentProps, splitProps } from "solid-js";
import * as AspectRatioPrimitive from "@radix-solid/aspect-ratio";
import { cn } from "@shadcn-solid/utils";

interface AspectRatioProps extends ComponentProps<
  typeof AspectRatioPrimitive.Root
> {
  class?: string;
}

const AspectRatio: Component<AspectRatioProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AspectRatioPrimitive.Root
      data-slot="aspect-ratio"
      class={cn(local.class)}
      {...rest}
    />
  );
};

export { AspectRatio };
export type { AspectRatioProps };
