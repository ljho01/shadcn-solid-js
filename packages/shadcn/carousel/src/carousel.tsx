import {
  type Component,
  type JSX,
  type Accessor,
  createContext,
  createSignal,
  useContext,
  splitProps,
  createMemo,
} from "solid-js";
import { cn } from "@shadcn-solid/utils";

/* -------------------------------- Context -------------------------------- */

interface CarouselContextValue {
  currentIndex: Accessor<number>;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: Accessor<boolean>;
  canScrollNext: Accessor<boolean>;
  orientation: "horizontal" | "vertical";
  itemCount: Accessor<number>;
  setItemCount: (count: number) => void;
}

const CarouselContext = createContext<CarouselContextValue>();

function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel");
  }
  return context;
}

/* -------------------------------- Carousel ------------------------------- */

interface CarouselProps extends JSX.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Carousel: Component<CarouselProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children", "orientation"]);
  const orientation = local.orientation ?? "horizontal";

  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [itemCount, setItemCount] = createSignal(0);

  const canScrollPrev = createMemo(() => currentIndex() > 0);
  const canScrollNext = createMemo(() => currentIndex() < itemCount() - 1);

  const scrollPrev = () => {
    if (canScrollPrev()) setCurrentIndex((i) => i - 1);
  };

  const scrollNext = () => {
    if (canScrollNext()) setCurrentIndex((i) => i + 1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (orientation === "horizontal") {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext();
      }
    } else {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollNext();
      }
    }
  };

  return (
    <CarouselContext.Provider
      value={{
        currentIndex,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        orientation,
        itemCount,
        setItemCount,
      }}
    >
      <div
        data-slot="carousel"
        role="region"
        aria-roledescription="carousel"
        class={cn("relative", local.class)}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {local.children}
      </div>
    </CarouselContext.Provider>
  );
};

/* ----------------------------- CarouselContent ---------------------------- */

const CarouselContent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  const { orientation, currentIndex } = useCarousel();

  return (
    <div class="overflow-hidden">
      <div
        data-slot="carousel-content"
        class={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          local.class
        )}
        style={{
          transform:
            orientation === "horizontal"
              ? `translateX(-${currentIndex() * 100}%)`
              : `translateY(-${currentIndex() * 100}%)`,
        }}
        {...rest}
      />
    </div>
  );
};

/* ------------------------------ CarouselItem ----------------------------- */

const CarouselItem: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  const { orientation } = useCarousel();

  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      class={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        local.class
      )}
      {...rest}
    />
  );
};

/* ---------------------------- CarouselPrevious --------------------------- */

const CarouselPrevious: Component<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  const { scrollPrev, canScrollPrev, orientation } = useCarousel();

  return (
    <button
      data-slot="carousel-previous"
      class={cn(
        "absolute touch-manipulation inline-flex size-8 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        local.class
      )}
      disabled={!canScrollPrev()}
      onClick={scrollPrev}
      {...rest}
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
      <span class="sr-only">Previous slide</span>
    </button>
  );
};

/* ------------------------------ CarouselNext ----------------------------- */

const CarouselNext: Component<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  const { scrollNext, canScrollNext, orientation } = useCarousel();

  return (
    <button
      data-slot="carousel-next"
      class={cn(
        "absolute touch-manipulation inline-flex size-8 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        local.class
      )}
      disabled={!canScrollNext()}
      onClick={scrollNext}
      {...rest}
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
      <span class="sr-only">Next slide</span>
    </button>
  );
};

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};
