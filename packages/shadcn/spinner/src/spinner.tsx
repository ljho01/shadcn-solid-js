import { type JSX, splitProps } from "solid-js";
import { cn } from "@shadcn-solid/utils";

interface SpinnerProps extends JSX.SvgSVGAttributes<SVGSVGElement> {}

function Spinner(props: SpinnerProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <svg
      data-slot="spinner"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cn("size-4 animate-spin", local.class)}
      {...rest}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export { Spinner };
export type { SpinnerProps };
