import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as AccordionPrimitive from "@radix-solid/accordion";
import { cn } from "@shadcn-solid/utils";

const Accordion: Component<ComponentProps<typeof AccordionPrimitive.Root>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      class={cn("flex w-full flex-col", local.class)}
      {...rest}
    />
  );
};

const AccordionItem: Component<
  ComponentProps<typeof AccordionPrimitive.Item>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      class={cn("not-last:border-b", local.class)}
      {...rest}
    />
  );
};

const AccordionTrigger: Component<
  ComponentProps<typeof AccordionPrimitive.Trigger> & { children?: JSX.Element }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <AccordionPrimitive.Header class="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        class={cn(
          "focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:after:border-ring group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          local.class
        )}
        {...rest}
      >
        {local.children}
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
          class="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
};

const AccordionContent: Component<
  ComponentProps<typeof AccordionPrimitive.Content> & { children?: JSX.Element }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      class="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden text-sm"
      {...rest}
    >
      <div
        class={cn(
          "[&_a]:hover:text-foreground h-[var(--radix-accordion-content-height)] pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
          local.class
        )}
      >
        {local.children}
      </div>
    </AccordionPrimitive.Content>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
