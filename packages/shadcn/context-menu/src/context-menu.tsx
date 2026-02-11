import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as ContextMenuPrimitive from "@radix-solid/context-menu";
import { cn } from "@shadcn-solid/utils";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuContent: Component<
  ComponentProps<typeof ContextMenuPrimitive.Content>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        class={cn(
          "bg-popover text-popover-foreground ring-foreground/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:overflow-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-36 origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg p-1 shadow-md ring-1 duration-100",
          local.class
        )}
        {...rest}
      />
    </ContextMenuPrimitive.Portal>
  );
};

const ContextMenuItem: Component<
  ComponentProps<typeof ContextMenuPrimitive.Item> & { inset?: boolean }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "inset"]);
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={local.inset || undefined}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive focus:*:[svg]:text-accent-foreground group/context-menu-item data-[disabled]:pointer-events-none data-[disabled]:opacity-50 relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    />
  );
};

const ContextMenuCheckboxItem: Component<
  ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> & {
    children?: JSX.Element;
    inset?: boolean;
  }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "inset"]);
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={local.inset || undefined}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    >
      <span class="pointer-events-none absolute right-2">
        <ContextMenuPrimitive.ItemIndicator>
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
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </ContextMenuPrimitive.CheckboxItem>
  );
};

const ContextMenuRadioItem: Component<
  ComponentProps<typeof ContextMenuPrimitive.RadioItem> & {
    children?: JSX.Element;
    inset?: boolean;
  }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "inset"]);
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={local.inset || undefined}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    >
      <span class="pointer-events-none absolute right-2">
        <ContextMenuPrimitive.ItemIndicator>
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
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </ContextMenuPrimitive.RadioItem>
  );
};

const ContextMenuLabel: Component<
  ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "inset"]);
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={local.inset || undefined}
      class={cn(
        "text-muted-foreground px-1.5 py-1 text-xs font-medium data-[inset]:pl-7",
        local.class
      )}
      {...rest}
    />
  );
};

const ContextMenuSeparator: Component<
  ComponentProps<typeof ContextMenuPrimitive.Separator>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      class={cn("bg-border -mx-1 my-1 h-px", local.class)}
      {...rest}
    />
  );
};

const ContextMenuSubTrigger: Component<
  ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "inset", "children"]);
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={local.inset || undefined}
      class={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-[inset]:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
    </ContextMenuPrimitive.SubTrigger>
  );
};

const ContextMenuSubContent: Component<
  ComponentProps<typeof ContextMenuPrimitive.SubContent>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent
        data-slot="context-menu-sub-content"
        class={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-lg border p-1 shadow-lg duration-100",
          local.class
        )}
        {...rest}
      />
    </ContextMenuPrimitive.Portal>
  );
};

const ContextMenuShortcut = (props: ComponentProps<"span">) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="context-menu-shortcut"
      class={cn(
        "text-muted-foreground group-focus/context-menu-item:text-accent-foreground ml-auto text-xs tracking-widest",
        local.class
      )}
      {...rest}
    />
  );
};

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
};
