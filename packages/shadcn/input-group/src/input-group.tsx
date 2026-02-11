import { type Component, type JSX, splitProps } from "solid-js";
import { cn } from "@shadcn-solid-js/utils";

/* ------------------------------- InputGroup ------------------------------- */

const InputGroup: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="input-group"
      class={cn(
        "border-input dark:bg-input/30 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-disabled:bg-input/50 dark:has-disabled:bg-input/80 group/input-group relative flex h-8 w-full min-w-0 items-center rounded-lg border transition-colors outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-3 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5",
        local.class
      )}
      {...rest}
    />
  );
};

/* ----------------------------- InputGroupAddon ----------------------------- */

interface InputGroupAddonProps extends JSX.HTMLAttributes<HTMLDivElement> {
  position?: "start" | "end";
}

const InputGroupAddon: Component<InputGroupAddonProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "position"]);
  return (
    <div
      data-slot="input-group-addon"
      class={cn(
        "text-muted-foreground h-auto gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4 flex cursor-text items-center justify-center select-none",
        local.position === "end"
          ? "pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem] order-last"
          : "pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem] order-first",
        local.class
      )}
      {...rest}
    />
  );
};

/* ----------------------------- InputGroupInput ----------------------------- */

const InputGroupInput: Component<JSX.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class", "type"]);
  return (
    <input
      data-slot="input-group-input"
      type={local.type}
      class={cn(
        "placeholder:text-muted-foreground file:text-foreground flex h-8 w-full min-w-0 px-2.5 py-1 text-base outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent",
        local.class
      )}
      {...rest}
    />
  );
};

export { InputGroup, InputGroupAddon, InputGroupInput };
export type { InputGroupAddonProps };
