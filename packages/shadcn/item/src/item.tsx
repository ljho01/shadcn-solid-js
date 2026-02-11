import { type Component, type JSX, splitProps } from "solid-js";
import { cn } from "@shadcn-solid-js/utils";

/* ---------------------------------- Item ---------------------------------- */

const Item: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="item"
      class={cn(
        "[a]:hover:bg-muted rounded-lg border text-sm w-full group/item focus-visible:border-ring focus-visible:ring-ring/50 flex items-center flex-wrap outline-none transition-colors duration-100 focus-visible:ring-[3px] [a]:transition-colors",
        local.class
      )}
      {...rest}
    />
  );
};

/* -------------------------------- ItemIcon -------------------------------- */

const ItemIcon: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="item-icon"
      class={cn("text-muted-foreground shrink-0 [&_svg]:size-5", local.class)}
      {...rest}
    />
  );
};

/* ------------------------------- ItemContent ------------------------------ */

const ItemContent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="item-content"
      class={cn(
        "flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",
        local.class
      )}
      {...rest}
    />
  );
};

/* ------------------------------- ItemTitle -------------------------------- */

const ItemTitle: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="item-title"
      class={cn(
        "line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4",
        local.class
      )}
      {...rest}
    />
  );
};

/* ----------------------------- ItemDescription ---------------------------- */

const ItemDescription: Component<JSX.HTMLAttributes<HTMLParagraphElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <p
      data-slot="item-description"
      class={cn(
        "text-muted-foreground [&>a:hover]:text-primary line-clamp-2 text-left text-sm leading-normal font-normal group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4",
        local.class
      )}
      {...rest}
    />
  );
};

/* ------------------------------- ItemAction ------------------------------- */

const ItemAction: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="item-action"
      class={cn("flex items-center gap-2", local.class)}
      {...rest}
    />
  );
};

export { Item, ItemIcon, ItemContent, ItemTitle, ItemDescription, ItemAction };
