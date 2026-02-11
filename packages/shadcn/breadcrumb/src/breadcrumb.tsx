import { type JSX, type ParentProps, splitProps } from "solid-js";
import { cn } from "@shadcn-solid/utils";

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbProps extends ParentProps<JSX.HTMLAttributes<HTMLElement>> {
  separator?: JSX.Element;
}

function Breadcrumb(props: BreadcrumbProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <nav
      data-slot="breadcrumb"
      aria-label="breadcrumb"
      class={local.class}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbList
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbListProps extends JSX.HTMLAttributes<HTMLOListElement> {}

function BreadcrumbList(props: BreadcrumbListProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <ol
      data-slot="breadcrumb-list"
      class={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word",
        local.class
      )}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbItem
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbItemProps extends JSX.HTMLAttributes<HTMLLIElement> {}

function BreadcrumbItem(props: BreadcrumbItemProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <li
      data-slot="breadcrumb-item"
      class={cn("inline-flex items-center gap-1", local.class)}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbLink
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {}

function BreadcrumbLink(props: BreadcrumbLinkProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <a
      data-slot="breadcrumb-link"
      class={cn("hover:text-foreground transition-colors", local.class)}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbPage
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbPageProps extends JSX.HTMLAttributes<HTMLSpanElement> {}

function BreadcrumbPage(props: BreadcrumbPageProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      class={cn("text-foreground font-normal", local.class)}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbSeparator
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbSeparatorProps extends JSX.HTMLAttributes<HTMLLIElement> {
  children?: JSX.Element;
}

function BreadcrumbSeparator(props: BreadcrumbSeparatorProps) {
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      class={cn("[&>svg]:size-3.5", local.class)}
      {...rest}
    >
      {local.children ?? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </li>
  );
}

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbEllipsis
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbEllipsisProps extends JSX.HTMLAttributes<HTMLSpanElement> {}

function BreadcrumbEllipsis(props: BreadcrumbEllipsisProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      class={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        local.class
      )}
      {...rest}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-4"
      >
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
      <span class="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
export type {
  BreadcrumbProps,
  BreadcrumbListProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbPageProps,
  BreadcrumbSeparatorProps,
  BreadcrumbEllipsisProps,
};
