import {
  type Component,
  type JSX,
  createContext,
  createSignal,
  createUniqueId,
  useContext,
  splitProps,
  onMount,
} from "solid-js";
import { cn } from "@shadcn-solid-js/utils";

/* -------------------------------- Context -------------------------------- */

interface ResizableContextValue {
  direction: "horizontal" | "vertical";
  registerPanel: (id: string, defaultSize: number) => void;
  getPanelSize: (id: string) => number;
  registerHandle: () => number;
  startResize: (handleIndex: number, event: PointerEvent) => void;
}

const ResizableContext = createContext<ResizableContextValue>();

function useResizable() {
  const context = useContext(ResizableContext);
  if (!context) {
    throw new Error("useResizable must be used within a ResizablePanelGroup");
  }
  return context;
}

/* --------------------------- ResizablePanelGroup -------------------------- */

interface ResizablePanelGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical";
}

const ResizablePanelGroup: Component<ResizablePanelGroupProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "direction"]);
  const direction = local.direction ?? "horizontal";

  const [panels, setPanels] = createSignal<Map<string, number>>(new Map());
  let panelOrder: string[] = [];
  let handleCount = 0;
  let containerRef!: HTMLDivElement;

  const registerPanel = (id: string, defaultSize: number) => {
    setPanels((prev) => {
      const next = new Map(prev);
      next.set(id, defaultSize);
      return next;
    });
    if (!panelOrder.includes(id)) {
      panelOrder.push(id);
    }
  };

  const getPanelSize = (id: string) => {
    return panels().get(id) ?? 50;
  };

  const startResize = (handleIndex: number, event: PointerEvent) => {
    event.preventDefault();
    const startPos = direction === "horizontal" ? event.clientX : event.clientY;
    const containerRect = containerRef.getBoundingClientRect();
    const containerSize =
      direction === "horizontal" ? containerRect.width : containerRect.height;

    const leftPanelId = panelOrder[handleIndex];
    const rightPanelId = panelOrder[handleIndex + 1];
    if (!leftPanelId || !rightPanelId) return;

    const startLeftSize = getPanelSize(leftPanelId);
    const startRightSize = getPanelSize(rightPanelId);

    const onPointerMove = (e: PointerEvent) => {
      const currentPos = direction === "horizontal" ? e.clientX : e.clientY;
      const delta = ((currentPos - startPos) / containerSize) * 100;

      const newLeftSize = Math.max(
        10,
        Math.min(startLeftSize + delta, startLeftSize + startRightSize - 10)
      );
      const newRightSize = startLeftSize + startRightSize - newLeftSize;

      setPanels((prev) => {
        const next = new Map(prev);
        next.set(leftPanelId, newLeftSize);
        next.set(rightPanelId, newRightSize);
        return next;
      });
    };

    const onPointerUp = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  };

  const registerHandle = () => {
    return handleCount++;
  };

  return (
    <ResizableContext.Provider
      value={{
        direction,
        registerPanel,
        getPanelSize,
        registerHandle,
        startResize,
      }}
    >
      <div
        ref={containerRef}
        data-slot="resizable-panel-group"
        data-direction={direction}
        class={cn(
          "flex h-full w-full",
          direction === "vertical" && "flex-col",
          local.class
        )}
        {...rest}
      >
        {local.children}
      </div>
    </ResizableContext.Provider>
  );
};

/* ------------------------------ ResizablePanel ----------------------------- */

interface ResizablePanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

const ResizablePanel: Component<ResizablePanelProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "defaultSize",
    "minSize",
    "maxSize",
  ]);
  const { registerPanel, getPanelSize, direction } = useResizable();

  const panelId = `panel-${createUniqueId()}`;
  const defaultSize = local.defaultSize ?? 50;

  onMount(() => {
    registerPanel(panelId, defaultSize);
  });

  const size = () => getPanelSize(panelId);

  return (
    <div
      data-slot="resizable-panel"
      data-panel-id={panelId}
      class={cn("overflow-hidden", local.class)}
      style={{
        [direction === "horizontal" ? "width" : "height"]: `${size()}%`,
        "flex-shrink": "0",
        "flex-grow": "0",
      }}
      {...rest}
    >
      {local.children}
    </div>
  );
};

/* ----------------------------- ResizableHandle ---------------------------- */

interface ResizableHandleProps extends JSX.HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean;
}

const ResizableHandle: Component<ResizableHandleProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "withHandle"]);
  const { direction, startResize, registerHandle } = useResizable();
  const handleIndex = registerHandle();

  return (
    <div
      data-slot="resizable-handle"
      class={cn(
        "bg-border focus-visible:ring-ring ring-offset-background relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:outline-hidden",
        direction === "horizontal"
          ? "w-px cursor-col-resize"
          : "h-px w-full cursor-row-resize after:left-0 after:h-1 after:w-full after:translate-x-0 after:-translate-y-1/2 [&>div]:rotate-90",
        local.class
      )}
      onPointerDown={(e) => startResize(handleIndex, e)}
      {...rest}
    >
      {local.withHandle && (
        <div class="bg-border z-10 flex h-6 w-1 shrink-0 rounded-lg" />
      )}
    </div>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
export type {
  ResizablePanelGroupProps,
  ResizablePanelProps,
  ResizableHandleProps,
};
