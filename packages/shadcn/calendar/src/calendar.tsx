import {
  type Component,
  type JSX,
  createSignal,
  createMemo,
  splitProps,
  For,
} from "solid-js";
import { cn } from "@shadcn-solid-js/utils";

/* -------------------------------- Helpers -------------------------------- */

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/* -------------------------------- Calendar ------------------------------- */

interface CalendarProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange" | "disabled" | "onSelect"
> {
  selected?: Date;
  defaultMonth?: Date;
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
}

const Calendar: Component<CalendarProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "selected",
    "defaultMonth",
    "onSelect",
    "disabled",
  ]);

  const initialDate = local.defaultMonth ?? local.selected ?? new Date();
  const [viewYear, setViewYear] = createSignal(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = createSignal(initialDate.getMonth());

  const daysInMonth = createMemo(() => getDaysInMonth(viewYear(), viewMonth()));
  const firstDay = createMemo(() =>
    getFirstDayOfMonth(viewYear(), viewMonth())
  );

  const monthLabel = createMemo(() => {
    const date = new Date(viewYear(), viewMonth());
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  });

  const weeks = createMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay(); i++) cells.push(null);
    for (let d = 1; d <= daysInMonth(); d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  });

  const prevMonth = () => {
    if (viewMonth() === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth() === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelect = (day: number) => {
    const date = new Date(viewYear(), viewMonth(), day);
    if (local.disabled?.(date)) return;
    local.onSelect?.(date);
  };

  return (
    <div
      data-slot="calendar"
      class={cn("bg-background group/calendar p-2", local.class)}
      {...rest}
    >
      {/* Header with navigation */}
      <div class="flex items-center justify-between pb-2">
        <button
          type="button"
          class="inline-flex size-7 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium select-none hover:bg-accent hover:text-accent-foreground aria-disabled:opacity-50"
          onClick={prevMonth}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div class="text-sm font-medium select-none">{monthLabel()}</div>
        <button
          type="button"
          class="inline-flex size-7 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium select-none hover:bg-accent hover:text-accent-foreground aria-disabled:opacity-50"
          onClick={nextMonth}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <For each={DAYS}>
              {(day) => (
                <th class="text-muted-foreground w-8 p-0 text-center text-[0.8rem] font-normal select-none">
                  {day}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={weeks()}>
            {(week) => (
              <tr>
                <For each={week}>
                  {(day) => {
                    if (day === null) {
                      return <td class="p-0 text-center text-sm" />;
                    }

                    const date = new Date(viewYear(), viewMonth(), day);
                    const isDisabled = () => local.disabled?.(date) ?? false;
                    const isSelected = () =>
                      local.selected ? isSameDay(local.selected, date) : false;
                    const isTodayCell = () => isToday(date);

                    return (
                      <td class="p-0 text-center text-sm">
                        <button
                          type="button"
                          class={cn(
                            "inline-flex size-8 items-center justify-center rounded-md text-sm font-normal leading-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:hover:text-foreground",
                            isSelected() &&
                              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                            isTodayCell() &&
                              !isSelected() &&
                              "bg-accent text-accent-foreground",
                            isDisabled() && "pointer-events-none opacity-50"
                          )}
                          disabled={isDisabled()}
                          onClick={() => handleSelect(day)}
                        >
                          {day}
                        </button>
                      </td>
                    );
                  }}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export { Calendar };
export type { CalendarProps };
