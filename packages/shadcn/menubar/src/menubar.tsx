import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as MenubarPrimitive from "@radix-solid/menubar";
import { cn } from "@shadcn-solid/utils";

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarSub = MenubarPrimitive.Sub;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

const Menubar: Component<ComponentProps<typeof MenubarPrimitive.Root>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      class={cn(
        "bg-background flex h-8 items-center gap-0.5 rounded-lg border p-[3px]",
        local.class
      )}
      {...rest}
    />
  );
};

const MenubarTrigger: Component<
  ComponentProps<typeof MenubarPrimitive.Trigger>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      class={cn(
        "hover:bg-muted data-[state=open]:bg-muted flex items-center rounded-sm px-1.5 py-[2px] text-sm font-medium outline-hidden select-none",
        local.class
      )}
      {...rest}
    />
  );
};

const MenubarContent: Component<
  ComponentProps<typeof MenubarPrimitive.Content>
> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "align",
    "alignOffset",
    "sideOffset",
  ]);
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={local.align ?? "start"}
        alignOffset={local.alignOffset ?? -4}
        sideOffset={local.sideOffset ?? 8}
        class={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 z-50 min-w-36 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg p-1 shadow-md ring-1 duration-100",
          local.class
        )}
        {...rest}
      />
    </MenubarPrimitive.Portal>
  );
};

const MenubarItem: Component<
  ComponentProps<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "inset", "variant"]);
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={local.inset || undefined}
      data-variant={local.variant}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive! not-data-[variant=destructive]:focus:**:text-accent-foreground group/menubar-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    />
  );
};

const MenubarCheckboxItem: Component<
  ComponentProps<typeof MenubarPrimitive.CheckboxItem> & {
    children?: JSX.Element;
    inset?: boolean;
  }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "inset"]);
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={local.inset || undefined}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-1.5 pl-7 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    >
      <span class="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenubarPrimitive.ItemIndicator>
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
        </MenubarPrimitive.ItemIndicator>
      </span>
      {local.children}
    </MenubarPrimitive.CheckboxItem>
  );
};

const MenubarRadioItem: Component<
  ComponentProps<typeof MenubarPrimitive.RadioItem> & {
    children?: JSX.Element;
    inset?: boolean;
  }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "inset"]);
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      data-inset={local.inset || undefined}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-1.5 pl-7 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    >
      <span class="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenubarPrimitive.ItemIndicator>
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
        </MenubarPrimitive.ItemIndicator>
      </span>
      {local.children}
    </MenubarPrimitive.RadioItem>
  );
};

const MenubarLabel: Component<
  ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "inset"]);
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={local.inset || undefined}
      class={cn(
        "px-1.5 py-1 text-sm font-medium data-[inset]:pl-7",
        local.class
      )}
      {...rest}
    />
  );
};

const MenubarSeparator: Component<
  ComponentProps<typeof MenubarPrimitive.Separator>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      class={cn("bg-border -mx-1 my-1 h-px", local.class)}
      {...rest}
    />
  );
};

const MenubarSubTrigger: Component<
  ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "inset", "children"]);
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={local.inset || undefined}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none data-[inset]:pl-7 [&_svg:not([class*='size-'])]:size-4",
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
    </MenubarPrimitive.SubTrigger>
  );
};

const MenubarSubContent: Component<
  ComponentProps<typeof MenubarPrimitive.SubContent>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent
        data-slot="menubar-sub-content"
        class={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 z-50 min-w-32 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg p-1 shadow-lg ring-1 duration-100",
          local.class
        )}
        {...rest}
      />
    </MenubarPrimitive.Portal>
  );
};

const MenubarShortcut = (props: ComponentProps<"span">) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="menubar-shortcut"
      class={cn(
        "text-muted-foreground group-focus/menubar-item:text-accent-foreground ml-auto text-xs tracking-widest",
        local.class
      )}
      {...rest}
    />
  );
};

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
