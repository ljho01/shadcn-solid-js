import { type Component, type ComponentProps, splitProps } from "solid-js";
import * as TogglePrimitive from "@radix-solid/toggle";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@shadcn-solid/utils";

const toggleVariants = cva(
  "hover:text-foreground aria-pressed:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[state=on]:bg-muted gap-1 rounded-lg text-sm font-medium transition-all [&_svg:not([class*='size-'])]:size-4 group/toggle hover:bg-muted inline-flex items-center justify-center whitespace-nowrap outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-input hover:bg-muted border bg-transparent",
      },
      size: {
        default: "h-8 min-w-8 px-2",
        sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-1.5 text-[0.8rem]",
        lg: "h-9 min-w-9 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ToggleProps = ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>;

const Toggle: Component<ToggleProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "variant", "size"]);
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      class={cn(
        toggleVariants({ variant: local.variant, size: local.size }),
        local.class
      )}
      {...rest}
    />
  );
};

export { Toggle, toggleVariants };
export type { ToggleProps };
