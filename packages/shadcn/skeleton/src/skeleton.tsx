import { type JSX, splitProps } from "solid-js";
import { cn } from "@shadcn-solid-js/utils";

interface SkeletonProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function Skeleton(props: SkeletonProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="skeleton"
      class={cn("bg-muted animate-pulse rounded-md", local.class)}
      {...rest}
    />
  );
}

export { Skeleton };
export type { SkeletonProps };
