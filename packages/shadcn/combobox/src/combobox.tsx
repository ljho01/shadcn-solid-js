import {
  type Component,
  For,
  Show,
  createMemo,
  createSignal,
  splitProps,
} from "solid-js";
import * as PopoverPrimitive from "@radix-solid/popover";
import { cn } from "@shadcn-solid/utils";

/* ------------------------------ ComboboxItem ------------------------------ */

interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/* ------------------------------- Combobox --------------------------------- */

interface ComboboxProps {
  class?: string;
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

const Combobox: Component<ComboboxProps> = (props) => {
  const [local] = splitProps(props, [
    "class",
    "options",
    "value",
    "onValueChange",
    "placeholder",
    "searchPlaceholder",
    "emptyText",
  ]);

  const [open, setOpen] = createSignal(false);
  const [search, setSearch] = createSignal("");

  const filteredOptions = createMemo(() => {
    const opts = local.options ?? [];
    const query = search().toLowerCase();
    if (!query) return opts;
    return opts.filter((opt) => opt.label.toLowerCase().includes(query));
  });

  const selectedLabel = createMemo(() => {
    const opts = local.options ?? [];
    const selected = opts.find((opt) => opt.value === local.value);
    return selected?.label;
  });

  const handleSelect = (value: string) => {
    local.onValueChange?.(value);
    setOpen(false);
    setSearch("");
  };

  return (
    <PopoverPrimitive.Root open={open()} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        data-slot="combobox-trigger"
        class={cn(
          "border-input bg-background flex h-9 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:border-ring focus:ring-ring/50 focus:ring-3 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          local.class
        )}
      >
        <span class={cn(!selectedLabel() && "text-muted-foreground")}>
          {selectedLabel() ?? local.placeholder ?? "Select..."}
        </span>
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
          class="ml-2 shrink-0 opacity-50"
        >
          <path d="m7 15 5 5 5-5" />
          <path d="m7 9 5-5 5 5" />
        </svg>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="combobox-content"
          class={cn(
            "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 z-50 w-[var(--radix-popover-trigger-width)] rounded-lg p-1 shadow-md ring-1 outline-hidden duration-100"
          )}
          sideOffset={4}
        >
          <div class="flex items-center border-b px-2 pb-1.5">
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
              class="mr-2 shrink-0 opacity-50"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              data-slot="combobox-input"
              class="placeholder:text-muted-foreground flex h-8 w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={local.searchPlaceholder ?? "Search..."}
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
            />
          </div>
          <div class="max-h-60 overflow-y-auto py-1">
            <Show
              when={filteredOptions().length > 0}
              fallback={
                <p class="text-muted-foreground py-6 text-center text-sm">
                  {local.emptyText ?? "No results found."}
                </p>
              }
            >
              <For each={filteredOptions()}>
                {(option) => (
                  <button
                    data-slot="combobox-item"
                    type="button"
                    disabled={option.disabled}
                    class={cn(
                      "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                      option.value === local.value && "bg-accent"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span
                      class={cn(
                        "mr-2 flex size-4 items-center justify-center",
                        option.value !== local.value && "invisible"
                      )}
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
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    {option.label}
                  </button>
                )}
              </For>
            </Show>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export { Combobox };
export type { ComboboxProps, ComboboxOption };
