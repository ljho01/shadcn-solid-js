import { type JSX, splitProps } from "solid-js";
import { cn } from "@shadcn-solid-js/utils";

/* -------------------------------------------------------------------------------------------------
 * Card
 * -----------------------------------------------------------------------------------------------*/

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function Card(props: CardProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="card"
      class={cn(
        "ring-foreground/10 bg-card text-card-foreground group/card flex flex-col gap-4 overflow-hidden rounded-xl py-4 text-sm ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        local.class
      )}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * CardHeader
 * -----------------------------------------------------------------------------------------------*/

interface CardHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function CardHeader(props: CardHeaderProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="card-header"
      class={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        local.class
      )}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * CardTitle
 * -----------------------------------------------------------------------------------------------*/

interface CardTitleProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function CardTitle(props: CardTitleProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="card-title"
      class={cn(
        "text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        local.class
      )}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * CardDescription
 * -----------------------------------------------------------------------------------------------*/

interface CardDescriptionProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function CardDescription(props: CardDescriptionProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="card-description"
      class={cn("text-muted-foreground text-sm", local.class)}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * CardAction
 * -----------------------------------------------------------------------------------------------*/

interface CardActionProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function CardAction(props: CardActionProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="card-action"
      class={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        local.class
      )}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * CardContent
 * -----------------------------------------------------------------------------------------------*/

interface CardContentProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function CardContent(props: CardContentProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="card-content"
      class={cn("px-4 group-data-[size=sm]/card:px-3", local.class)}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * CardFooter
 * -----------------------------------------------------------------------------------------------*/

interface CardFooterProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function CardFooter(props: CardFooterProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="card-footer"
      class={cn(
        "bg-muted/50 flex items-center rounded-b-xl border-t p-4 group-data-[size=sm]/card:p-3",
        local.class
      )}
      {...rest}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
};
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardActionProps,
  CardContentProps,
  CardFooterProps,
};
