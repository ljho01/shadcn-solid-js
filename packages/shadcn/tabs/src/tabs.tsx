import { type Component, type ComponentProps, splitProps } from "solid-js";
import * as TabsPrimitive from "@radix-solid-js/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shadcn-solid-js/utils";

const Tabs: Component<ComponentProps<typeof TabsPrimitive.Root>> = (props) => {
  const [local, rest] = splitProps(props, ["class", "orientation"]);
  const orientation = () => local.orientation ?? "horizontal";
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation()}
      orientation={orientation()}
      class={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        local.class
      )}
      {...rest}
    />
  );
};

const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-[orientation=horizontal]/tabs:h-8 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const TabsList: Component<
  ComponentProps<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "variant"]);
  const variant = () => local.variant ?? "default";
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant()}
      class={cn(tabsListVariants({ variant: variant() }), local.class)}
      {...rest}
    />
  );
};

const TabsTrigger: Component<ComponentProps<typeof TabsPrimitive.Trigger>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      class={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:text-foreground",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        local.class
      )}
      {...rest}
    />
  );
};

const TabsContent: Component<ComponentProps<typeof TabsPrimitive.Content>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      class={cn("flex-1 text-sm outline-none", local.class)}
      {...rest}
    />
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
