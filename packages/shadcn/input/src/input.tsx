import { type JSX, splitProps } from "solid-js";
import { cn } from "@shadcn-solid/utils";

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}

function Input(props: InputProps) {
  const [local, rest] = splitProps(props, ["class", "type"]);

  return (
    <input
      data-slot="input"
      type={local.type}
      class={cn(
        "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 file:text-foreground placeholder:text-muted-foreground h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm",
        local.class
      )}
      {...rest}
    />
  );
}

export { Input };
export type { InputProps };
