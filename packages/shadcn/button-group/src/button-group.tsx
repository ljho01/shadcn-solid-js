import { type Component, type JSX, splitProps } from "solid-js";
import { cn } from "@shadcn-solid-js/utils";

interface ButtonGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {}

const ButtonGroup: Component<ButtonGroupProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="button-group"
      class={cn(
        "has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg flex w-fit items-stretch *:focus-visible:z-10 *:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg! [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        local.class
      )}
      role="group"
      {...rest}
    />
  );
};

export { ButtonGroup };
export type { ButtonGroupProps };
