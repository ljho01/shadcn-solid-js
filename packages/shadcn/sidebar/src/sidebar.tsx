import {
  type Component,
  type JSX,
  type Accessor,
  createContext,
  createSignal,
  useContext,
  splitProps,
} from "solid-js";
import { cn } from "@shadcn-solid-js/utils";

/* -------------------------------- Context -------------------------------- */

interface SidebarContextValue {
  open: Accessor<boolean>;
  setOpen: (value: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue>();

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

/* ------------------------------ Provider ------------------------------ */

interface SidebarProviderProps extends JSX.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SidebarProvider: Component<SidebarProviderProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "defaultOpen",
    "open",
    "onOpenChange",
  ]);

  const [internalOpen, setInternalOpen] = createSignal(
    local.defaultOpen ?? true
  );

  const open = () => (local.open !== undefined ? local.open : internalOpen());
  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    local.onOpenChange?.(value);
  };
  const toggleSidebar = () => setOpen(!open());

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      <div
        data-slot="sidebar-provider"
        class={cn(
          "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
          local.class
        )}
        {...rest}
      >
        {local.children}
      </div>
    </SidebarContext.Provider>
  );
};

/* -------------------------------- Sidebar -------------------------------- */

interface SidebarProps extends JSX.HTMLAttributes<HTMLElement> {
  side?: "left" | "right";
}

const Sidebar: Component<SidebarProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "side"]);
  const { open } = useSidebar();

  return (
    <aside
      data-slot="sidebar"
      data-state={open() ? "expanded" : "collapsed"}
      data-side={local.side ?? "left"}
      class={cn(
        "bg-sidebar text-sidebar-foreground border-sidebar-border flex h-full w-[--sidebar-width,16rem] shrink-0 flex-col border-r transition-[width] duration-200",
        !open() && "w-[--sidebar-width-collapsed,3rem]",
        local.side === "right" && "border-r-0 border-l order-last",
        local.class
      )}
      {...rest}
    >
      {local.children}
    </aside>
  );
};

/* -------------------------------- Header -------------------------------- */

const SidebarHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sidebar-header"
      class={cn("flex flex-col gap-2 p-2", local.class)}
      {...rest}
    />
  );
};

/* -------------------------------- Content -------------------------------- */

const SidebarContent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sidebar-content"
      class={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        local.class
      )}
      {...rest}
    />
  );
};

/* -------------------------------- Footer -------------------------------- */

const SidebarFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sidebar-footer"
      class={cn("flex flex-col gap-2 p-2", local.class)}
      {...rest}
    />
  );
};

/* -------------------------------- Group -------------------------------- */

const SidebarGroup: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sidebar-group"
      class={cn("relative flex w-full min-w-0 flex-col p-2", local.class)}
      {...rest}
    />
  );
};

/* ------------------------------ GroupLabel ----------------------------- */

const SidebarGroupLabel: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sidebar-group-label"
      class={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        local.class
      )}
      {...rest}
    />
  );
};

/* ----------------------------- GroupContent ---------------------------- */

const SidebarGroupContent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sidebar-group-content"
      class={cn("w-full text-sm", local.class)}
      {...rest}
    />
  );
};

/* -------------------------------- Menu -------------------------------- */

const SidebarMenu: Component<JSX.HTMLAttributes<HTMLUListElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ul
      data-slot="sidebar-menu"
      class={cn("flex w-full min-w-0 flex-col gap-0", local.class)}
      {...rest}
    />
  );
};

/* ------------------------------ MenuItem ------------------------------ */

const SidebarMenuItem: Component<JSX.HTMLAttributes<HTMLLIElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <li
      data-slot="sidebar-menu-item"
      class={cn("group/menu-item relative", local.class)}
      {...rest}
    />
  );
};

/* ----------------------------- MenuButton ----------------------------- */

interface SidebarMenuButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

const SidebarMenuButton: Component<SidebarMenuButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "isActive"]);
  return (
    <button
      data-slot="sidebar-menu-button"
      data-active={local.isActive ? "" : undefined}
      class={cn(
        "ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active]:bg-sidebar-accent data-[active]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground gap-2 rounded-md p-2 text-left text-sm transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 data-[active]:font-medium peer/menu-button flex w-full items-center overflow-hidden outline-hidden group/menu-button disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&_svg]:size-4 [&_svg]:shrink-0",
        local.class
      )}
      {...rest}
    />
  );
};

/* ------------------------------ Trigger ------------------------------- */

const SidebarTrigger: Component<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class", "onClick"]);
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-slot="sidebar-trigger"
      class={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-sm",
        local.class
      )}
      onClick={(e) => {
        if (typeof local.onClick === "function") local.onClick(e);
        toggleSidebar();
      }}
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
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
      <span class="sr-only">Toggle Sidebar</span>
    </button>
  );
};

/* -------------------------------- Inset -------------------------------- */

const SidebarInset: Component<JSX.HTMLAttributes<HTMLElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <main
      data-slot="sidebar-inset"
      class={cn(
        "bg-background relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        local.class
      )}
      {...rest}
    />
  );
};

/* -------------------------------- Rail -------------------------------- */

const SidebarRail: Component<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class", "onClick"]);
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      class={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        local.class
      )}
      onClick={(e) => {
        if (typeof local.onClick === "function") local.onClick(e);
        toggleSidebar();
      }}
      {...rest}
    />
  );
};

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
  useSidebar,
};
