import { type Component, type JSX, splitProps } from "solid-js";
import { cn } from "@shadcn-solid-js/utils";

/* ---------------------------------- Empty --------------------------------- */

const Empty: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="empty"
      class={cn(
        "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance",
        local.class
      )}
      {...rest}
    />
  );
};

/* -------------------------------- EmptyIcon ------------------------------- */

const EmptyIcon: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="empty-icon"
      class={cn("text-muted-foreground [&_svg]:size-12", local.class)}
      {...rest}
    />
  );
};

/* ------------------------------- EmptyTitle ------------------------------- */

const EmptyTitle: Component<JSX.HTMLAttributes<HTMLHeadingElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <h3
      data-slot="empty-title"
      class={cn("text-sm font-medium tracking-tight", local.class)}
      {...rest}
    />
  );
};

/* ----------------------------- EmptyDescription --------------------------- */

const EmptyDescription: Component<JSX.HTMLAttributes<HTMLParagraphElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <p
      data-slot="empty-description"
      class={cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        local.class
      )}
      {...rest}
    />
  );
};

/* ------------------------------ EmptyAction ------------------------------- */

const EmptyAction: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="empty-action"
      class={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance",
        local.class
      )}
      {...rest}
    />
  );
};

export { Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyAction };
