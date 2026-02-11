import {
  type Component,
  type ComponentProps,
  type JSX,
  createContext,
  splitProps,
  useContext,
} from "solid-js";
import * as ToggleGroupPrimitive from "@radix-solid-js/toggle-group";
import { type VariantProps } from "class-variance-authority";
import { toggleVariants } from "@shadcn-solid-js/toggle";
import { cn } from "@shadcn-solid-js/utils";

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & {
  spacing?: number;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
  spacing: 0,
});

type ToggleGroupProps = ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
  };

const ToggleGroup: Component<ToggleGroupProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "variant",
    "size",
    "spacing",
    "children",
  ]);
  const spacing = () => local.spacing ?? 0;
  return (
    <ToggleGroupContext.Provider
      value={{
        variant: local.variant,
        size: local.size,
        spacing: spacing(),
      }}
    >
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group"
        data-variant={local.variant}
        data-size={local.size}
        data-spacing={spacing()}
        style={{ "--gap": spacing() } as JSX.CSSProperties}
        class={cn(
          "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[size=sm]:rounded-[min(var(--radius-md),10px)]",
          local.class
        )}
        {...rest}
      >
        {local.children}
      </ToggleGroupPrimitive.Root>
    </ToggleGroupContext.Provider>
  );
};

type ToggleGroupItemProps = ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>;

const ToggleGroupItem: Component<ToggleGroupItemProps> = (props) => {
  const context = useContext(ToggleGroupContext);
  const [local, rest] = splitProps(props, ["class", "variant", "size"]);
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || local.variant}
      data-size={context.size || local.size}
      data-spacing={context.spacing}
      class={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:last:rounded-b-lg group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || local.variant,
          size: context.size || local.size,
        }),
        local.class
      )}
      {...rest}
    />
  );
};

export { ToggleGroup, ToggleGroupItem };
