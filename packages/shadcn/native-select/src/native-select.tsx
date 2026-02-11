import { type Component, type JSX, splitProps } from "solid-js";
import { cn } from "@shadcn-solid/utils";

interface NativeSelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {}

const NativeSelect: Component<NativeSelectProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <select
      data-slot="native-select"
      class={cn(
        "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-8 w-full min-w-0 appearance-none rounded-lg border bg-transparent py-1 pr-8 pl-2.5 text-sm transition-colors outline-none select-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:ring-3 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-[size=sm]:py-0.5",
        local.class
      )}
      {...rest}
    />
  );
};

export { NativeSelect };
export type { NativeSelectProps };
