import { type JSX, splitProps } from "solid-js";
import { cn } from "@shadcn-solid-js/utils";
import { type ButtonProps, buttonVariants } from "@shadcn-solid-js/button";

/* -------------------------------------------------------------------------------------------------
 * Pagination
 * -----------------------------------------------------------------------------------------------*/

interface PaginationProps extends JSX.HTMLAttributes<HTMLElement> {}

function Pagination(props: PaginationProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <nav
      data-slot="pagination"
      role="navigation"
      aria-label="pagination"
      class={cn("mx-auto flex w-full justify-center", local.class)}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * PaginationContent
 * -----------------------------------------------------------------------------------------------*/

interface PaginationContentProps extends JSX.HTMLAttributes<HTMLUListElement> {}

function PaginationContent(props: PaginationContentProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <ul
      data-slot="pagination-content"
      class={cn("flex items-center gap-0.5", local.class)}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * PaginationItem
 * -----------------------------------------------------------------------------------------------*/

interface PaginationItemProps extends JSX.HTMLAttributes<HTMLLIElement> {}

function PaginationItem(props: PaginationItemProps) {
  return <li data-slot="pagination-item" {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * PaginationLink
 * -----------------------------------------------------------------------------------------------*/

interface PaginationLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
  size?: ButtonProps["size"];
}

function PaginationLink(props: PaginationLinkProps) {
  const [local, rest] = splitProps(props, ["class", "isActive", "size"]);

  return (
    <a
      data-slot="pagination-link"
      aria-current={local.isActive ? "page" : undefined}
      data-active={local.isActive ? "" : undefined}
      class={cn(
        buttonVariants({
          variant: local.isActive ? "outline" : "ghost",
          size: local.size ?? "icon",
        }),
        local.class
      )}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * PaginationPrevious
 * -----------------------------------------------------------------------------------------------*/

interface PaginationPreviousProps extends PaginationLinkProps {}

function PaginationPrevious(props: PaginationPreviousProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <PaginationLink
      data-slot="pagination-previous"
      aria-label="Go to previous page"
      size="default"
      class={cn("pl-1.5!", local.class)}
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
        <path d="m15 18-6-6 6-6" />
      </svg>
      <span class="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

/* -------------------------------------------------------------------------------------------------
 * PaginationNext
 * -----------------------------------------------------------------------------------------------*/

interface PaginationNextProps extends PaginationLinkProps {}

function PaginationNext(props: PaginationNextProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <PaginationLink
      data-slot="pagination-next"
      aria-label="Go to next page"
      size="default"
      class={cn("pr-1.5!", local.class)}
      {...rest}
    >
      <span class="hidden sm:block">Next</span>
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
        <path d="m9 18 6-6-6-6" />
      </svg>
    </PaginationLink>
  );
}

/* -------------------------------------------------------------------------------------------------
 * PaginationEllipsis
 * -----------------------------------------------------------------------------------------------*/

interface PaginationEllipsisProps extends JSX.HTMLAttributes<HTMLSpanElement> {}

function PaginationEllipsis(props: PaginationEllipsisProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden="true"
      class={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
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
      <span class="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
export type {
  PaginationProps,
  PaginationContentProps,
  PaginationItemProps,
  PaginationLinkProps,
  PaginationPreviousProps,
  PaginationNextProps,
  PaginationEllipsisProps,
};
