import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as SelectPrimitive from "@radix-solid/select";
import { cn } from "@shadcn-solid/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger: Component<
  ComponentProps<typeof SelectPrimitive.Trigger> & { children?: JSX.Element }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      class={cn(
        "border-input data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 flex w-fit items-center justify-between gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    >
      {local.children}
      <SelectPrimitive.Icon>
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
          class="text-muted-foreground pointer-events-none size-4"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
};

const SelectContent: Component<
  ComponentProps<typeof SelectPrimitive.Content> & { children?: JSX.Element }
> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "position",
    "sideOffset",
  ]);
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        sideOffset={local.sideOffset ?? 4}
        class={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg shadow-md ring-1 duration-100",
          (local.position ?? "popper") === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          local.class
        )}
        position={local.position ?? "popper"}
        {...rest}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          class={cn(
            "p-1",
            (local.position ?? "popper") === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {local.children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
};

const SelectLabel: Component<ComponentProps<typeof SelectPrimitive.Label>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      class={cn("text-muted-foreground px-1.5 py-1 text-xs", local.class)}
      {...rest}
    />
  );
};

const SelectItem: Component<
  ComponentProps<typeof SelectPrimitive.Item> & { children?: JSX.Element }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      class={cn(
        "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        local.class
      )}
      {...rest}
    >
      <span
        data-slot="select-item-indicator"
        class="pointer-events-none absolute right-2 flex size-4 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
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
            class="size-4"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{local.children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
};

const SelectSeparator: Component<
  ComponentProps<typeof SelectPrimitive.Separator>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      class={cn("bg-border pointer-events-none -mx-1 my-1 h-px", local.class)}
      {...rest}
    />
  );
};

const SelectScrollUpButton: Component<
  ComponentProps<typeof SelectPrimitive.ScrollUpButton>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      class={cn(
        "bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
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
        class="size-4"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </SelectPrimitive.ScrollUpButton>
  );
};

const SelectScrollDownButton: Component<
  ComponentProps<typeof SelectPrimitive.ScrollDownButton>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      class={cn(
        "bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
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
        class="size-4"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </SelectPrimitive.ScrollDownButton>
  );
};

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
