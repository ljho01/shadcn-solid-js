import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as NavigationMenuPrimitive from "@radix-solid/navigation-menu";
import { cn } from "@shadcn-solid/utils";

const NavigationMenuItem: Component<
  ComponentProps<typeof NavigationMenuPrimitive.Item>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      class={cn("relative", local.class)}
      {...rest}
    />
  );
};

const NavigationMenu: Component<
  ComponentProps<typeof NavigationMenuPrimitive.Root> & {
    children?: JSX.Element;
  }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      class={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        local.class
      )}
      {...rest}
    >
      {local.children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  );
};

const NavigationMenuList: Component<
  ComponentProps<typeof NavigationMenuPrimitive.List>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      class={cn(
        "group flex flex-1 list-none items-center justify-center gap-0",
        local.class
      )}
      {...rest}
    />
  );
};

const NavigationMenuTrigger: Component<
  ComponentProps<typeof NavigationMenuPrimitive.Trigger> & {
    children?: JSX.Element;
  }
> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      class={cn(
        "bg-background hover:bg-muted focus:bg-muted data-[state=open]:hover:bg-muted data-[state=open]:focus:bg-muted data-[state=open]:bg-muted/50 focus-visible:ring-ring/50 data-[popup-open]:bg-muted/50 data-[popup-open]:hover:bg-muted rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all focus-visible:ring-3 focus-visible:outline-1 disabled:opacity-50 group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center disabled:pointer-events-none outline-none group",
        local.class
      )}
      {...rest}
    >
      {local.children}
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
        class="relative top-px ml-1 size-3 transition duration-300 group-data-[state=open]/navigation-menu-trigger:rotate-180 group-data-[popup-open]/navigation-menu-trigger:rotate-180"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </NavigationMenuPrimitive.Trigger>
  );
};

const NavigationMenuContent: Component<
  ComponentProps<typeof NavigationMenuPrimitive.Content>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      class={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:ring-foreground/10 top-0 left-0 w-full p-1 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-lg group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:ring-1 group-data-[viewport=false]/navigation-menu:duration-300 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none md:absolute md:w-auto",
        local.class
      )}
      {...rest}
    />
  );
};

const NavigationMenuLink: Component<
  ComponentProps<typeof NavigationMenuPrimitive.Link>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      class={cn(
        "data-[active=true]:focus:bg-muted data-[active=true]:hover:bg-muted data-[active=true]:bg-muted/50 focus-visible:ring-ring/50 hover:bg-muted focus:bg-muted flex items-center gap-2 rounded-lg p-2 text-sm transition-all outline-none focus-visible:ring-3 focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-md [&_svg:not([class*='size-'])]:size-4",
        local.class
      )}
      {...rest}
    />
  );
};

const NavigationMenuViewport: Component<
  ComponentProps<typeof NavigationMenuPrimitive.Viewport>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div class="isolate z-50 absolute top-full left-0 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        class={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 ring-foreground/10 origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-lg shadow ring-1 duration-100 md:w-[var(--radix-navigation-menu-viewport-width)]",
          local.class
        )}
        {...rest}
      />
    </div>
  );
};

const NavigationMenuIndicator: Component<
  ComponentProps<typeof NavigationMenuPrimitive.Indicator>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      class={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        local.class
      )}
      {...rest}
    >
      <div class="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
};

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
