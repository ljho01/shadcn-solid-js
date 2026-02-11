import { type JSX, splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shadcn-solid/utils";

/* -------------------------------------------------------------------------------------------------
 * Alert
 * -----------------------------------------------------------------------------------------------*/

const alertVariants = cva(
  "grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 w-full relative group/alert",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps
  extends
    JSX.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

function Alert(props: AlertProps) {
  const [local, rest] = splitProps(props, ["class", "variant"]);

  return (
    <div
      data-slot="alert"
      role="alert"
      class={cn(alertVariants({ variant: local.variant }), local.class)}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * AlertTitle
 * -----------------------------------------------------------------------------------------------*/

interface AlertTitleProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function AlertTitle(props: AlertTitleProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="alert-title"
      class={cn(
        "[&_a]:hover:text-foreground font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3",
        local.class
      )}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * AlertDescription
 * -----------------------------------------------------------------------------------------------*/

interface AlertDescriptionProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function AlertDescription(props: AlertDescriptionProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="alert-description"
      class={cn(
        "text-muted-foreground [&_a]:hover:text-foreground text-sm text-balance md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
        local.class
      )}
      {...rest}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
export type { AlertProps, AlertTitleProps, AlertDescriptionProps };
