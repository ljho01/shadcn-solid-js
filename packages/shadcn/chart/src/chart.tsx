import {
  type Component,
  type JSX,
  createContext,
  useContext,
  splitProps,
  For,
  Show,
} from "solid-js";
import { cn } from "@shadcn-solid-js/utils";

/* -------------------------------- Types -------------------------------- */

interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
    icon?: Component;
  };
}

/* -------------------------------- Context -------------------------------- */

const ChartContext = createContext<ChartConfig>({});

function useChart() {
  return useContext(ChartContext);
}

/* ----------------------------- ChartContainer ----------------------------- */

interface ChartContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

const ChartContainer: Component<ChartContainerProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "config"]);

  const cssVars = () => {
    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(local.config)) {
      if (value.color) {
        vars[`--color-${key}`] = value.color;
      }
    }
    return vars;
  };

  return (
    <ChartContext.Provider value={local.config}>
      <div
        data-slot="chart-container"
        class={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          local.class
        )}
        style={cssVars()}
        {...rest}
      >
        {local.children}
      </div>
    </ChartContext.Provider>
  );
};

/* ----------------------------- ChartTooltip ------------------------------ */

interface ChartTooltipProps extends JSX.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  content?: JSX.Element;
}

const ChartTooltip: Component<ChartTooltipProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "active",
    "content",
    "children",
  ]);

  return (
    <Show when={local.active}>
      <div
        data-slot="chart-tooltip"
        class={cn(
          "border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
          local.class
        )}
        {...rest}
      >
        {local.content ?? local.children}
      </div>
    </Show>
  );
};

/* ------------------------- ChartTooltipContent --------------------------- */

interface ChartTooltipContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: string;
  indicator?: "line" | "dot" | "dashed";
}

const ChartTooltipContent: Component<ChartTooltipContentProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "hideLabel",
    "hideIndicator",
    "label",
    "indicator",
  ]);
  return (
    <div
      data-slot="chart-tooltip-content"
      class={cn("grid gap-1.5", local.class)}
      {...rest}
    >
      <Show when={!local.hideLabel && local.label}>
        <div class="font-medium">{local.label}</div>
      </Show>
      {local.children}
    </div>
  );
};

/* ------------------------------ ChartLegend ------------------------------ */

interface ChartLegendProps extends JSX.HTMLAttributes<HTMLDivElement> {
  content?: JSX.Element;
}

const ChartLegend: Component<ChartLegendProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "content", "children"]);

  return (
    <div
      data-slot="chart-legend"
      class={cn("flex items-center justify-center gap-4", local.class)}
      {...rest}
    >
      {local.content ?? local.children}
    </div>
  );
};

/* --------------------------- ChartLegendContent -------------------------- */

interface ChartLegendContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  hideIcon?: boolean;
  nameKey?: string;
}

const ChartLegendContent: Component<ChartLegendContentProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "hideIcon",
    "nameKey",
  ]);
  const config = useChart();

  const items = () => Object.entries(config);

  return (
    <div
      data-slot="chart-legend-content"
      class={cn("flex items-center justify-center gap-4", local.class)}
      {...rest}
    >
      <For each={items()}>
        {([key, value]) => (
          <div class="flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-muted-foreground">
            <Show when={!local.hideIcon}>
              <div
                class="size-2 shrink-0 rounded-[2px]"
                style={{ background: value.color ?? `var(--color-${key})` }}
              />
            </Show>
            <span class="text-muted-foreground">{value.label ?? key}</span>
          </div>
        )}
      </For>
      {local.children}
    </div>
  );
};

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
};
export type {
  ChartConfig,
  ChartContainerProps,
  ChartTooltipProps,
  ChartTooltipContentProps,
  ChartLegendProps,
  ChartLegendContentProps,
};
