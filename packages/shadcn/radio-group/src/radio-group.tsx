import { type Component, type ComponentProps, splitProps } from "solid-js";
import * as RadioGroupPrimitive from "@radix-solid/radio-group";
import { cn } from "@shadcn-solid/utils";

const RadioGroup: Component<ComponentProps<typeof RadioGroupPrimitive.Root>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      class={cn("grid w-full gap-2", local.class)}
      {...rest}
    />
  );
};

const RadioGroupItem: Component<
  ComponentProps<typeof RadioGroupPrimitive.Item>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      class={cn(
        "border-input text-primary dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3",
        local.class
      )}
      {...rest}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        class="group-aria-invalid/radio-group-item:text-destructive text-primary flex size-4 items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
};

export { RadioGroup, RadioGroupItem };
