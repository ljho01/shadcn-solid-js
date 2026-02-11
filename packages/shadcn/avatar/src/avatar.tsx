import { type Component, type ComponentProps, splitProps } from "solid-js";
import * as AvatarPrimitive from "@radix-solid-js/avatar";
import { cn } from "@shadcn-solid-js/utils";

/* --------------------------------- Avatar --------------------------------- */

const Avatar: Component<ComponentProps<typeof AvatarPrimitive.Root>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      class={cn(
        "after:border-border group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
        local.class
      )}
      {...rest}
    />
  );
};

/* ------------------------------- AvatarImage ------------------------------ */

const AvatarImage: Component<ComponentProps<typeof AvatarPrimitive.Image>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      class={cn(
        "aspect-square size-full rounded-full object-cover",
        local.class
      )}
      {...rest}
    />
  );
};

/* ----------------------------- AvatarFallback ----------------------------- */

const AvatarFallback: Component<
  ComponentProps<typeof AvatarPrimitive.Fallback>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      class={cn(
        "bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs",
        local.class
      )}
      {...rest}
    />
  );
};

export { Avatar, AvatarImage, AvatarFallback };
