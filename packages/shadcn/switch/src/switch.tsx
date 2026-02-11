import { type Component, type ComponentProps, splitProps } from "solid-js";
import * as SwitchPrimitive from "@radix-solid/switch";
import { cn } from "@shadcn-solid/utils";

const Switch: Component<ComponentProps<typeof SwitchPrimitive.Root>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      class={cn(
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-[state=unchecked]:bg-input/80 peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 aria-invalid:ring-3 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]",
        local.class
      )}
      {...rest}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        class={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
};

export { Switch };
