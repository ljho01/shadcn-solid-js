import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as DropdownMenuPrimitive from "@radix-solid-js/dropdown-menu";
import { cn } from "@shadcn-solid-js/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuContent: Component<
  ComponentProps<typeof DropdownMenuPrimitive.Content>
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "sideOffset"]);
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={local.sideOffset ?? 4}
        class={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg p-1 shadow-md ring-1 ring-foreground/10 duration-100 data-[state=closed]:overflow-hidden",
          local.class
        )}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  );
};

const DropdownMenuItem: Component<
  ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "inset", "variant"]);
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={local.inset || undefined}
      data-variant={local.variant || undefined}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    />
  );
};

const DropdownMenuCheckboxItem: Component<
  ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
    children?: JSX.Element;
    inset?: boolean;
  }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "inset"]);
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={local.inset || undefined}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    >
      <span
        class="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
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
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
};

const DropdownMenuRadioItem: Component<
  ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
    children?: JSX.Element;
    inset?: boolean;
  }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "inset"]);
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={local.inset || undefined}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    >
      <span
        class="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
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
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </DropdownMenuPrimitive.RadioItem>
  );
};

const DropdownMenuLabel: Component<
  ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "inset"]);
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={local.inset || undefined}
      class={cn(
        "text-muted-foreground px-1.5 py-1 text-xs font-medium data-[inset]:pl-7",
        local.class
      )}
      {...rest}
    />
  );
};

const DropdownMenuSeparator: Component<
  ComponentProps<typeof DropdownMenuPrimitive.Separator>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      class={cn("bg-border -mx-1 my-1 h-px", local.class)}
      {...rest}
    />
  );
};

const DropdownMenuSubTrigger: Component<
  ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "inset", "children"]);
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={local.inset || undefined}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
        class="ml-auto size-4"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </DropdownMenuPrimitive.SubTrigger>
  );
};

const DropdownMenuSubContent: Component<
  ComponentProps<typeof DropdownMenuPrimitive.SubContent>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        class={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 z-50 min-w-[96px] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md p-1 shadow-lg ring-1 duration-100",
          local.class
        )}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  );
};

const DropdownMenuShortcut = (props: ComponentProps<"span">) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      class={cn(
        "text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest",
        local.class
      )}
      {...rest}
    />
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
