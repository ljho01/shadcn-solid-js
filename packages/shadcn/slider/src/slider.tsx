import { type Component, type ComponentProps, splitProps } from "solid-js";
import * as SliderPrimitive from "@radix-solid/slider";
import { cn } from "@shadcn-solid/utils";

const Slider: Component<ComponentProps<typeof SliderPrimitive.Root>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      class={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        local.class
      )}
      {...rest}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        class="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          class="bg-primary absolute select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        class="border-ring ring-ring/50 relative block size-3 shrink-0 rounded-full border bg-white transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  );
};

export { Slider };
