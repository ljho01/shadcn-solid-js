import {
  type Component,
  type ComponentProps,
  type JSX,
  createContext,
  createSignal,
  useContext,
  splitProps,
  Show,
} from "solid-js";
import * as DialogPrimitive from "@radix-solid/dialog";
import { cn } from "@shadcn-solid/utils";

/* -------------------------------- Context -------------------------------- */

interface CommandContextValue {
  search: () => string;
  setSearch: (value: string) => void;
}

const CommandContext = createContext<CommandContextValue>();

function useCommand() {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error("useCommand must be used within a Command");
  }
  return context;
}

/* -------------------------------- Command -------------------------------- */

interface CommandProps extends JSX.HTMLAttributes<HTMLDivElement> {}

const Command: Component<CommandProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  const [search, setSearch] = createSignal("");

  return (
    <CommandContext.Provider value={{ search, setSearch }}>
      <div
        data-slot="command"
        class={cn(
          "bg-popover text-popover-foreground flex size-full flex-col overflow-hidden rounded-xl! p-1",
          local.class
        )}
        {...rest}
      >
        {local.children}
      </div>
    </CommandContext.Provider>
  );
};

/* ------------------------------ CommandInput ------------------------------ */

interface CommandInputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}

const CommandInput: Component<CommandInputProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  const { search, setSearch } = useCommand();

  return (
    <div
      class="flex h-9 items-center gap-2 border-b px-3"
      data-slot="command-input-wrapper"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-4 shrink-0 opacity-50"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        data-slot="command-input"
        class={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          local.class
        )}
        value={search()}
        onInput={(e) => setSearch(e.currentTarget.value)}
        {...rest}
      />
    </div>
  );
};

/* ------------------------------ CommandList ------------------------------- */

const CommandList: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="command-list"
      class={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        local.class
      )}
      {...rest}
    />
  );
};

/* ------------------------------ CommandEmpty ----------------------------- */

const CommandEmpty: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="command-empty"
      class={cn("py-6 text-center text-sm", local.class)}
      {...rest}
    />
  );
};

/* ------------------------------ CommandGroup ----------------------------- */

interface CommandGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  heading?: string;
}

const CommandGroup: Component<CommandGroupProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "heading"]);
  return (
    <div
      data-slot="command-group"
      class={cn(
        "text-foreground [&_[data-slot=command-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[data-slot=command-group-heading]]:px-2 [&_[data-slot=command-group-heading]]:py-1.5 [&_[data-slot=command-group-heading]]:text-xs [&_[data-slot=command-group-heading]]:font-medium",
        local.class
      )}
      {...rest}
    >
      <Show when={local.heading}>
        <div data-slot="command-group-heading">{local.heading}</div>
      </Show>
      {local.children}
    </div>
  );
};

/* ------------------------------ CommandItem ------------------------------ */

interface CommandItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  value?: string;
}

const CommandItem: Component<CommandItemProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "disabled", "value"]);
  return (
    <div
      data-slot="command-item"
      data-value={local.value}
      data-disabled={local.disabled ? "true" : undefined}
      class={cn(
        "data-[selected=true]:bg-muted data-[selected=true]:text-foreground data-[selected=true]:*:[svg]:text-foreground group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    />
  );
};

/* --------------------------- CommandSeparator --------------------------- */

const CommandSeparator: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="command-separator"
      role="separator"
      class={cn("bg-border -mx-1 h-px", local.class)}
      {...rest}
    />
  );
};

/* ----------------------------- CommandShortcut ----------------------------- */

const CommandShortcut: Component<JSX.HTMLAttributes<HTMLSpanElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="command-shortcut"
      class={cn(
        "text-muted-foreground group-data-[selected=true]/command-item:text-foreground ml-auto text-xs tracking-widest",
        local.class
      )}
      {...rest}
    />
  );
};

/* ----------------------------- CommandDialog ----------------------------- */

interface CommandDialogProps extends ComponentProps<
  typeof DialogPrimitive.Root
> {
  children?: JSX.Element;
  title?: string;
  description?: string;
}

const CommandDialog: Component<CommandDialogProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "title", "description"]);
  return (
    <DialogPrimitive.Root {...rest}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs" />
        <DialogPrimitive.Content class="bg-background ring-foreground/10 fixed top-1/3 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 translate-y-0 rounded-xl ring-1 duration-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden p-0">
          <span class="sr-only">{local.title ?? "Command Palette"}</span>
          <span class="sr-only">
            {local.description ?? "Search for a command to run..."}
          </span>
          <Command class="**:data-[slot=command-input-wrapper]:h-12 [&_[data-slot=command-input-wrapper]_svg]:h-5 [&_[data-slot=command-input-wrapper]_svg]:w-5 [&_[data-slot=command-input]]:h-12 [&_[data-slot=command-item]]:px-2 [&_[data-slot=command-item]]:py-3 [&_[data-slot=command-item]_svg]:h-5 [&_[data-slot=command-item]_svg]:w-5">
            {local.children}
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandDialog,
};
