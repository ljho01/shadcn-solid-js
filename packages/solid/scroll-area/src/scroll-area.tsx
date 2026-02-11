import {
  type JSX,
  createSignal,
  createEffect,
  onCleanup,
  onMount,
  splitProps,
  Show,
} from 'solid-js';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { mergeRefs } from '@radix-solid-js/compose-refs';
import { createContextScope, type Scope } from '@radix-solid-js/context';
import { useDirection, type Direction } from '@radix-solid-js/direction';
import { Presence } from '@radix-solid-js/presence';
import { Primitive } from '@radix-solid-js/primitive-component';
import { clamp } from '@radix-solid-js/number';
import { createStateMachine } from './use-state-machine';

/* -------------------------------------------------------------------------------------------------
 * ScrollArea
 * -----------------------------------------------------------------------------------------------*/

const SCROLL_AREA_NAME = 'ScrollArea';

type ScopedProps<P> = P & { __scopeScrollArea?: Scope };
const [createScrollAreaContext, createScrollAreaScope] = createContextScope(SCROLL_AREA_NAME);

type ScrollAreaContextValue = {
  type: 'auto' | 'always' | 'scroll' | 'hover';
  dir: Direction;
  scrollHideDelay: number;
  scrollArea: HTMLDivElement | null;
  viewport: HTMLDivElement | null;
  onViewportChange: (viewport: HTMLDivElement | null) => void;
  content: HTMLDivElement | null;
  onContentChange: (content: HTMLDivElement | null) => void;
  scrollbarX: HTMLDivElement | null;
  onScrollbarXChange: (scrollbar: HTMLDivElement | null) => void;
  scrollbarXEnabled: boolean;
  onScrollbarXEnabledChange: (enabled: boolean) => void;
  scrollbarY: HTMLDivElement | null;
  onScrollbarYChange: (scrollbar: HTMLDivElement | null) => void;
  scrollbarYEnabled: boolean;
  onScrollbarYEnabledChange: (enabled: boolean) => void;
  onCornerWidthChange: (width: number) => void;
  onCornerHeightChange: (height: number) => void;
};

const [ScrollAreaProvider, useScrollAreaContext] =
  createScrollAreaContext<ScrollAreaContextValue>(SCROLL_AREA_NAME);

interface ScrollAreaProps extends JSX.HTMLAttributes<HTMLDivElement> {
  type?: 'auto' | 'always' | 'scroll' | 'hover';
  dir?: Direction;
  scrollHideDelay?: number;
  ref?: (el: HTMLElement) => void;
}

function ScrollArea(inProps: ScopedProps<ScrollAreaProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeScrollArea',
    'type',
    'dir',
    'scrollHideDelay',
    'ref',
    'children',
    'style',
  ]);

  const direction = useDirection(local.dir);
  const [scrollArea, setScrollArea] = createSignal<HTMLDivElement | null>(null);
  const [viewport, setViewport] = createSignal<HTMLDivElement | null>(null);
  const [content, setContent] = createSignal<HTMLDivElement | null>(null);
  const [scrollbarX, setScrollbarX] = createSignal<HTMLDivElement | null>(null);
  const [scrollbarY, setScrollbarY] = createSignal<HTMLDivElement | null>(null);
  const [cornerWidth, setCornerWidth] = createSignal(0);
  const [cornerHeight, setCornerHeight] = createSignal(0);
  const [scrollbarXEnabled, setScrollbarXEnabled] = createSignal(false);
  const [scrollbarYEnabled, setScrollbarYEnabled] = createSignal(false);

  return (
    <ScrollAreaProvider
      scope={local.__scopeScrollArea}
      type={local.type ?? 'hover'}
      dir={direction}
      scrollHideDelay={local.scrollHideDelay ?? 600}
      scrollArea={scrollArea()}
      viewport={viewport()}
      onViewportChange={setViewport}
      content={content()}
      onContentChange={setContent}
      scrollbarX={scrollbarX()}
      onScrollbarXChange={setScrollbarX}
      scrollbarXEnabled={scrollbarXEnabled()}
      onScrollbarXEnabledChange={setScrollbarXEnabled}
      scrollbarY={scrollbarY()}
      onScrollbarYChange={setScrollbarY}
      scrollbarYEnabled={scrollbarYEnabled()}
      onScrollbarYEnabledChange={setScrollbarYEnabled}
      onCornerWidthChange={setCornerWidth}
      onCornerHeightChange={setCornerHeight}
    >
      <Primitive.div
        dir={direction}
        {...rest}
        ref={mergeRefs(local.ref, (el: HTMLElement) => setScrollArea(el as HTMLDivElement))}
        style={{
          position: 'relative',
          // Hide native scrollbars on the root level
          '--radix-scroll-area-corner-width': `${cornerWidth()}px`,
          '--radix-scroll-area-corner-height': `${cornerHeight()}px`,
          ...(typeof local.style === 'object' ? local.style : {}),
        } as JSX.CSSProperties}
      >
        {local.children}
      </Primitive.div>
    </ScrollAreaProvider>
  );
}

ScrollArea.displayName = SCROLL_AREA_NAME;

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaViewport
 * -----------------------------------------------------------------------------------------------*/

const VIEWPORT_NAME = 'ScrollAreaViewport';

interface ScrollAreaViewportProps extends JSX.HTMLAttributes<HTMLDivElement> {
  nonce?: string;
  ref?: (el: HTMLElement) => void;
}

function ScrollAreaViewport(inProps: ScopedProps<ScrollAreaViewportProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeScrollArea',
    'children',
    'nonce',
    'ref',
    'style',
  ]);

  const context = useScrollAreaContext(VIEWPORT_NAME, local.__scopeScrollArea);

  return (
    <>
      {/* Hide native scrollbars via injected style */}
      <style nonce={local.nonce}>{
        `[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}`
      }</style>
      <Primitive.div
        data-radix-scroll-area-viewport=""
        {...rest}
        ref={mergeRefs(local.ref, (el: HTMLElement) => context.onViewportChange(el as HTMLDivElement))}
        style={{
          'overflow-x': context.scrollbarXEnabled ? 'scroll' : 'hidden',
          'overflow-y': context.scrollbarYEnabled ? 'scroll' : 'hidden',
          ...(typeof local.style === 'object' ? local.style : {}),
        }}
      >
        <div
          ref={(el) => context.onContentChange(el as HTMLDivElement)}
          style={{ 'min-width': '100%', display: 'table' }}
        >
          {local.children}
        </div>
      </Primitive.div>
    </>
  );
}

ScrollAreaViewport.displayName = VIEWPORT_NAME;

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaScrollbar
 * -----------------------------------------------------------------------------------------------*/

const SCROLLBAR_NAME = 'ScrollAreaScrollbar';

interface ScrollAreaScrollbarProps extends ScrollAreaScrollbarVisibleProps {
  forceMount?: true;
}

function ScrollAreaScrollbar(inProps: ScopedProps<ScrollAreaScrollbarProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeScrollArea', 'forceMount', 'orientation']);
  const context = useScrollAreaContext(SCROLLBAR_NAME, local.__scopeScrollArea);
  const { onScrollbarXEnabledChange, onScrollbarYEnabledChange } = context;
  const isHorizontal = () => (local.orientation ?? 'vertical') === 'horizontal';

  createEffect(() => {
    if (isHorizontal()) {
      onScrollbarXEnabledChange(true);
    } else {
      onScrollbarYEnabledChange(true);
    }
    onCleanup(() => {
      if (isHorizontal()) {
        onScrollbarXEnabledChange(false);
      } else {
        onScrollbarYEnabledChange(false);
      }
    });
  });

  const type = context.type;

  return (
    <Show when={type !== 'hover'} fallback={
      <ScrollAreaScrollbarHover
        {...rest}
        __scopeScrollArea={local.__scopeScrollArea}
        orientation={local.orientation}
        forceMount={local.forceMount}
      />
    }>
      <Show when={type !== 'scroll'} fallback={
        <ScrollAreaScrollbarScroll
          {...rest}
          __scopeScrollArea={local.__scopeScrollArea}
          orientation={local.orientation}
          forceMount={local.forceMount}
        />
      }>
        <Show when={type !== 'auto'} fallback={
          <ScrollAreaScrollbarAuto
            {...rest}
            __scopeScrollArea={local.__scopeScrollArea}
            orientation={local.orientation}
            forceMount={local.forceMount}
          />
        }>
          {/* type === 'always' */}
          <ScrollAreaScrollbarVisible
            {...rest}
            __scopeScrollArea={local.__scopeScrollArea}
            orientation={local.orientation}
          />
        </Show>
      </Show>
    </Show>
  );
}

ScrollAreaScrollbar.displayName = SCROLLBAR_NAME;

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaScrollbarHover
 * -----------------------------------------------------------------------------------------------*/

function ScrollAreaScrollbarHover(
  inProps: ScopedProps<ScrollAreaScrollbarProps>
) {
  const [local, rest] = splitProps(inProps, ['__scopeScrollArea', 'forceMount', 'orientation']);
  const context = useScrollAreaContext('ScrollAreaScrollbarHover', local.__scopeScrollArea);
  const [visible, setVisible] = createSignal(false);

  createEffect(() => {
    const scrollArea = context.scrollArea;
    const delay = context.scrollHideDelay;
    let hideTimer = 0;

    if (scrollArea) {
      const handlePointerEnter = () => {
        window.clearTimeout(hideTimer);
        setVisible(true);
      };
      const handlePointerLeave = () => {
        hideTimer = window.setTimeout(() => setVisible(false), delay);
      };
      scrollArea.addEventListener('pointerenter', handlePointerEnter);
      scrollArea.addEventListener('pointerleave', handlePointerLeave);

      onCleanup(() => {
        window.clearTimeout(hideTimer);
        scrollArea.removeEventListener('pointerenter', handlePointerEnter);
        scrollArea.removeEventListener('pointerleave', handlePointerLeave);
      });
    }
  });

  return (
    <Presence present={local.forceMount || visible()}>
      <ScrollAreaScrollbarVisible
        {...rest}
        __scopeScrollArea={local.__scopeScrollArea}
        orientation={local.orientation}
        data-state={visible() ? 'visible' : 'hidden'}
      />
    </Presence>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaScrollbarScroll
 * -----------------------------------------------------------------------------------------------*/

function ScrollAreaScrollbarScroll(
  inProps: ScopedProps<ScrollAreaScrollbarProps>
) {
  const [local, rest] = splitProps(inProps, ['__scopeScrollArea', 'forceMount', 'orientation']);
  const context = useScrollAreaContext('ScrollAreaScrollbarScroll', local.__scopeScrollArea);
  const [state, send] = createStateMachine('hidden', {
    hidden: { SCROLL: 'scrolling' },
    scrolling: { SCROLL_END: 'idle', POINTER_ENTER: 'interacting' },
    interacting: { SCROLL: 'interacting', POINTER_LEAVE: 'idle' },
    idle: { HIDE: 'hidden', SCROLL: 'scrolling', POINTER_ENTER: 'interacting' },
  });
  const isHidden = () => state() === 'hidden';

  createEffect(() => {
    if (state() === 'idle') {
      const hideTimer = window.setTimeout(() => send('HIDE'), context.scrollHideDelay);
      onCleanup(() => window.clearTimeout(hideTimer));
    }
  });

  createEffect(() => {
    const viewport = context.viewport;
    let prevScrollLeft = viewport?.scrollLeft ?? 0;
    let prevScrollTop = viewport?.scrollTop ?? 0;

    if (viewport) {
      const handleScroll = () => {
        const scrollLeft = viewport.scrollLeft;
        const scrollTop = viewport.scrollTop;
        const hasScrollChanged =
          prevScrollLeft !== scrollLeft || prevScrollTop !== scrollTop;
        if (hasScrollChanged) {
          send('SCROLL');
          // We'll send SCROLL_END after a debounce
          clearTimeout((handleScroll as any)._tid);
          (handleScroll as any)._tid = setTimeout(() => send('SCROLL_END'), 100);
        }
        prevScrollLeft = scrollLeft;
        prevScrollTop = scrollTop;
      };
      viewport.addEventListener('scroll', handleScroll);
      onCleanup(() => viewport.removeEventListener('scroll', handleScroll));
    }
  });

  return (
    <Presence present={local.forceMount || !isHidden()}>
      <ScrollAreaScrollbarVisible
        {...rest}
        __scopeScrollArea={local.__scopeScrollArea}
        orientation={local.orientation}
        data-state={isHidden() ? 'hidden' : 'visible'}
        onPointerEnter={composeEventHandlers(rest.onPointerEnter as any, () => send('POINTER_ENTER'))}
        onPointerLeave={composeEventHandlers(rest.onPointerLeave as any, () => send('POINTER_LEAVE'))}
      />
    </Presence>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaScrollbarAuto
 * -----------------------------------------------------------------------------------------------*/

function ScrollAreaScrollbarAuto(
  inProps: ScopedProps<ScrollAreaScrollbarProps>
) {
  const [local, rest] = splitProps(inProps, ['__scopeScrollArea', 'forceMount', 'orientation']);
  const context = useScrollAreaContext('ScrollAreaScrollbarAuto', local.__scopeScrollArea);
  const [visible, setVisible] = createSignal(false);
  const isHorizontal = () => (local.orientation ?? 'vertical') === 'horizontal';

  const handleResize = () => {
    const viewport = context.viewport;
    if (viewport) {
      const isOverflowX = viewport.offsetWidth < viewport.scrollWidth;
      const isOverflowY = viewport.offsetHeight < viewport.scrollHeight;
      setVisible(isHorizontal() ? isOverflowX : isOverflowY);
    }
  };

  // Observe viewport for resize/scroll changes
  createEffect(() => {
    const viewport = context.viewport;
    if (viewport) {
      handleResize();
      const observer = new ResizeObserver(handleResize);
      observer.observe(viewport);
      onCleanup(() => observer.disconnect());
    }
  });

  // Also check on content resize
  createEffect(() => {
    const content = context.content;
    if (content) {
      const observer = new ResizeObserver(handleResize);
      observer.observe(content);
      onCleanup(() => observer.disconnect());
    }
  });

  return (
    <Presence present={local.forceMount || visible()}>
      <ScrollAreaScrollbarVisible
        {...rest}
        __scopeScrollArea={local.__scopeScrollArea}
        orientation={local.orientation}
        data-state={visible() ? 'visible' : 'hidden'}
      />
    </Presence>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaScrollbarVisible
 * -----------------------------------------------------------------------------------------------*/

type ScrollAreaScrollbarVisibleProps = JSX.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
  ref?: (el: HTMLElement) => void;
};

function ScrollAreaScrollbarVisible(
  inProps: ScopedProps<ScrollAreaScrollbarVisibleProps>
) {
  const [local, rest] = splitProps(inProps, [
    '__scopeScrollArea',
    'orientation',
    'ref',
  ]);

  const isHorizontal = () => (local.orientation ?? 'vertical') === 'horizontal';

  return (
    <Show
      when={isHorizontal()}
      fallback={
        <ScrollAreaScrollbarAxisY
          {...rest}
          __scopeScrollArea={local.__scopeScrollArea}
          ref={local.ref}
        />
      }
    >
      <ScrollAreaScrollbarAxisX
        {...rest}
        __scopeScrollArea={local.__scopeScrollArea}
        ref={local.ref}
      />
    </Show>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaScrollbarAxisX
 * -----------------------------------------------------------------------------------------------*/

type ScrollAreaScrollbarAxisProps = JSX.HTMLAttributes<HTMLDivElement> & {
  ref?: (el: HTMLElement) => void;
};

function ScrollAreaScrollbarAxisX(inProps: ScopedProps<ScrollAreaScrollbarAxisProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeScrollArea', 'ref']);
  const context = useScrollAreaContext('ScrollAreaScrollbarAxisX', local.__scopeScrollArea);
  const [sizes, setSizes] = createSignal<Sizes>({ content: 0, viewport: 0, scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 } });

  const thumbRatio = () => getThumbRatio(sizes().viewport, sizes().content);

  const handleSizesChange = (newSizes: Sizes) => {
    setSizes(newSizes);
  };

  const getScrollPosition = () => {
    const viewport = context.viewport;
    if (!viewport) return 0;
    return context.dir === 'rtl' ? -viewport.scrollLeft : viewport.scrollLeft;
  };

  return (
    <ScrollAreaScrollbarImpl
      {...rest}
      __scopeScrollArea={local.__scopeScrollArea}
      ref={mergeRefs(local.ref, (el: HTMLElement) => context.onScrollbarXChange(el as HTMLDivElement))}
      data-orientation="horizontal"
      sizes={sizes()}
      onSizesChange={handleSizesChange}
      hasThumb={thumbRatio() > 0 && thumbRatio() < 1}
      onThumbPointerDown={() => {
        // Store the initial pointer position for dragging
      }}
      onDragScroll={(pointerPos) => {
        const viewport = context.viewport;
        if (viewport) {
          const scrollRatio = pointerPos / sizes().scrollbar.size;
          viewport.scrollLeft = scrollRatio * sizes().content;
        }
      }}
      onThumbPositionChange={() => {
        const viewport = context.viewport;
        const scrollbar = context.scrollbarX;
        if (viewport && scrollbar) {
          const scrollPos = getScrollPosition();
          const offset = getThumbOffsetFromScroll(scrollPos, sizes());
          const thumb = scrollbar.querySelector<HTMLElement>('[data-radix-scroll-area-thumb]');
          if (thumb) {
            thumb.style.transform = `translate3d(${offset}px, 0, 0)`;
          }
        }
      }}
      style={{
        bottom: '0',
        left: context.dir === 'rtl' ? 'var(--radix-scroll-area-corner-width)' : '0',
        right: context.dir === 'ltr' ? 'var(--radix-scroll-area-corner-width)' : '0',
        '--radix-scroll-area-thumb-width': `${getThumbSize(sizes())}px`,
        ...(typeof rest.style === 'object' ? rest.style : {}),
      } as JSX.CSSProperties}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaScrollbarAxisY
 * -----------------------------------------------------------------------------------------------*/

function ScrollAreaScrollbarAxisY(inProps: ScopedProps<ScrollAreaScrollbarAxisProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeScrollArea', 'ref']);
  const context = useScrollAreaContext('ScrollAreaScrollbarAxisY', local.__scopeScrollArea);
  const [sizes, setSizes] = createSignal<Sizes>({ content: 0, viewport: 0, scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 } });

  const thumbRatio = () => getThumbRatio(sizes().viewport, sizes().content);

  const handleSizesChange = (newSizes: Sizes) => {
    setSizes(newSizes);
  };

  return (
    <ScrollAreaScrollbarImpl
      {...rest}
      __scopeScrollArea={local.__scopeScrollArea}
      ref={mergeRefs(local.ref, (el: HTMLElement) => context.onScrollbarYChange(el as HTMLDivElement))}
      data-orientation="vertical"
      sizes={sizes()}
      onSizesChange={handleSizesChange}
      hasThumb={thumbRatio() > 0 && thumbRatio() < 1}
      onThumbPointerDown={(_pointerPos) => {
        // Store the initial pointer position for dragging
      }}
      onDragScroll={(pointerPos) => {
        const viewport = context.viewport;
        if (viewport) {
          const scrollRatio = pointerPos / sizes().scrollbar.size;
          viewport.scrollTop = scrollRatio * sizes().content;
        }
      }}
      onThumbPositionChange={() => {
        const viewport = context.viewport;
        const scrollbar = context.scrollbarY;
        if (viewport && scrollbar) {
          const offset = getThumbOffsetFromScroll(viewport.scrollTop, sizes());
          const thumb = scrollbar.querySelector<HTMLElement>('[data-radix-scroll-area-thumb]');
          if (thumb) {
            thumb.style.transform = `translate3d(0, ${offset}px, 0)`;
          }
        }
      }}
      style={{
        top: '0',
        right: context.dir === 'ltr' ? '0' : undefined,
        left: context.dir === 'rtl' ? '0' : undefined,
        bottom: 'var(--radix-scroll-area-corner-height)',
        '--radix-scroll-area-thumb-height': `${getThumbSize(sizes())}px`,
        ...(typeof rest.style === 'object' ? rest.style : {}),
      } as JSX.CSSProperties}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaScrollbarImpl (shared implementation)
 * -----------------------------------------------------------------------------------------------*/

type Sizes = {
  content: number;
  viewport: number;
  scrollbar: { size: number; paddingStart: number; paddingEnd: number };
};

type ScrollAreaScrollbarImplContextValue = {
  hasThumb: boolean;
  scrollbar: HTMLDivElement | null;
  onThumbChange: (thumb: HTMLDivElement | null) => void;
  onThumbPositionChange: () => void;
  onThumbPointerUp: () => void;
  onThumbPointerDown: (pointerPos: number) => void;
};

const [ScrollbarProvider, useScrollbarContext] =
  createScrollAreaContext<ScrollAreaScrollbarImplContextValue>('ScrollAreaScrollbar');

interface ScrollAreaScrollbarImplProps extends JSX.HTMLAttributes<HTMLDivElement> {
  'data-orientation'?: 'horizontal' | 'vertical';
  sizes: Sizes;
  hasThumb: boolean;
  onSizesChange: (sizes: Sizes) => void;
  onThumbPointerDown: (pointerPos: number) => void;
  onDragScroll: (pointerPos: number) => void;
  onThumbPositionChange: () => void;
  ref?: (el: HTMLElement) => void;
}

function ScrollAreaScrollbarImpl(inProps: ScopedProps<ScrollAreaScrollbarImplProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeScrollArea',
    'sizes',
    'hasThumb',
    'onSizesChange',
    'onThumbPointerDown',
    'onDragScroll',
    'onThumbPositionChange',
    'ref',
  ]);

  const context = useScrollAreaContext('ScrollAreaScrollbarImpl', local.__scopeScrollArea);
  const [scrollbar, setScrollbar] = createSignal<HTMLDivElement | null>(null);
  const [, setThumb] = createSignal<HTMLDivElement | null>(null);
  let rectRef: DOMRect | null = null;
  let prevWebkitUserSelectRef = '';

  const isHorizontal = () => rest['data-orientation'] === 'horizontal';

  // Calculate and report sizes
  const handleResize = () => {
    const el = scrollbar();
    const viewport = context.viewport;
    if (el && viewport) {
      const size = isHorizontal() ? el.clientWidth : el.clientHeight;
      const cssStyles = getComputedStyle(el);
      local.onSizesChange({
        content: isHorizontal() ? viewport.scrollWidth : viewport.scrollHeight,
        viewport: isHorizontal() ? viewport.offsetWidth : viewport.offsetHeight,
        scrollbar: {
          size,
          paddingStart: toInt(cssStyles.paddingLeft),
          paddingEnd: toInt(cssStyles.paddingRight),
        },
      });
    }
  };

  // Watch the scrollbar for resize
  createEffect(() => {
    const el = scrollbar();
    if (el) {
      const observer = new ResizeObserver(handleResize);
      observer.observe(el);
      onCleanup(() => observer.disconnect());
    }
  });

  // Watch viewport for resize
  createEffect(() => {
    const viewport = context.viewport;
    if (viewport) {
      const observer = new ResizeObserver(handleResize);
      observer.observe(viewport);
      onCleanup(() => observer.disconnect());
    }
  });

  // Track scroll position to update thumb
  createEffect(() => {
    const viewport = context.viewport;
    if (viewport) {
      const handleScroll = () => local.onThumbPositionChange();
      viewport.addEventListener('scroll', handleScroll);
      onCleanup(() => viewport.removeEventListener('scroll', handleScroll));
    }
  });

  const handlePointerDown = (event: PointerEvent) => {
    const mainPointer = 0;
    if (event.button !== mainPointer) return;

    const target = event.target as HTMLElement;
    target.setPointerCapture(event.pointerId);
    rectRef = scrollbar()?.getBoundingClientRect() ?? null;

    // Store initial pointer offset
    prevWebkitUserSelectRef = document.body.style.webkitUserSelect;
    document.body.style.webkitUserSelect = 'none';

    if (context.viewport) {
      if (rectRef) {
        const offset = isHorizontal()
          ? event.clientX - rectRef.left
          : event.clientY - rectRef.top;
        local.onDragScroll(offset);
      }
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (rectRef) {
      const offset = isHorizontal()
        ? event.clientX - rectRef.left
        : event.clientY - rectRef.top;
      local.onDragScroll(offset);
    }
  };

  const handlePointerUp = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    document.body.style.webkitUserSelect = prevWebkitUserSelectRef;
    rectRef = null;
  };

  return (
    <ScrollbarProvider
      scope={local.__scopeScrollArea}
      scrollbar={scrollbar()}
      hasThumb={local.hasThumb}
      onThumbChange={setThumb}
      onThumbPositionChange={local.onThumbPositionChange}
      onThumbPointerUp={() => {
        document.body.style.webkitUserSelect = prevWebkitUserSelectRef;
        rectRef = null;
      }}
      onThumbPointerDown={(pointerPos) => {
        local.onThumbPointerDown(pointerPos);
      }}
    >
      <Primitive.div
        {...rest}
        ref={mergeRefs(local.ref, (el: HTMLElement) => setScrollbar(el as HTMLDivElement))}
        style={{
          position: 'absolute',
          ...(typeof rest.style === 'object' ? rest.style : {}),
        }}
        onPointerDown={composeEventHandlers(
          rest.onPointerDown as any,
          handlePointerDown as any
        )}
        onPointerMove={composeEventHandlers(
          rest.onPointerMove as any,
          handlePointerMove as any
        )}
        onPointerUp={composeEventHandlers(
          rest.onPointerUp as any,
          handlePointerUp as any
        )}
      />
    </ScrollbarProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaThumb
 * -----------------------------------------------------------------------------------------------*/

const THUMB_NAME = 'ScrollAreaThumb';

interface ScrollAreaThumbProps extends JSX.HTMLAttributes<HTMLDivElement> {
  'data-orientation'?: 'horizontal' | 'vertical';
  ref?: (el: HTMLElement) => void;
}

function ScrollAreaThumb(inProps: ScopedProps<ScrollAreaThumbProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeScrollArea', 'ref', 'style']);
  const scrollbarContext = useScrollbarContext(THUMB_NAME, local.__scopeScrollArea);

  let thumbRef: HTMLElement | undefined;

  const handlePointerDown = (event: PointerEvent) => {
    const thumb = event.currentTarget as HTMLElement;
    const thumbRect = thumb.getBoundingClientRect();
    const orientation = rest['data-orientation'] ?? 'vertical';
    const x = event.clientX - thumbRect.left;
    const y = event.clientY - thumbRect.top;
    scrollbarContext.onThumbPointerDown(orientation === 'horizontal' ? x : y);
  };

  const handlePointerUp = () => {
    scrollbarContext.onThumbPointerUp();
  };

  // Update thumb position on mount and viewport changes
  onMount(() => {
    scrollbarContext.onThumbPositionChange();
  });

  // Register capture-phase pointerdown listener manually.
  // React-style `onPointerDownCapture` does NOT work in SolidJS.
  createEffect(() => {
    const el = thumbRef;
    if (!el) return;

    const handler = (event: PointerEvent) => {
      handlePointerDown(event);
    };
    el.addEventListener("pointerdown", handler, true);

    onCleanup(() => {
      el.removeEventListener("pointerdown", handler, true);
    });
  });

  return (
    <Primitive.div
      data-radix-scroll-area-thumb=""
      data-state={scrollbarContext.hasThumb ? 'visible' : 'hidden'}
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) => {
        thumbRef = el;
        scrollbarContext.onThumbChange(el as HTMLDivElement);
      })}
      style={{
        width: 'var(--radix-scroll-area-thumb-width)',
        height: 'var(--radix-scroll-area-thumb-height)',
        ...(typeof local.style === 'object' ? local.style : {}),
      }}
      onPointerUp={composeEventHandlers(
        rest.onPointerUp as any,
        handlePointerUp as any
      )}
    />
  );
}

ScrollAreaThumb.displayName = THUMB_NAME;

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaCorner
 * -----------------------------------------------------------------------------------------------*/

const CORNER_NAME = 'ScrollAreaCorner';

interface ScrollAreaCornerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
}

function ScrollAreaCorner(inProps: ScopedProps<ScrollAreaCornerProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeScrollArea', 'ref', 'style']);
  const context = useScrollAreaContext(CORNER_NAME, local.__scopeScrollArea);
  const [width, setWidth] = createSignal(0);
  const [height, setHeight] = createSignal(0);
  const hasSize = () => Boolean(width()) && Boolean(height());

  // Observe scrollbar sizes to set corner dimensions
  createEffect(() => {
    const scrollbarX = context.scrollbarX;
    if (scrollbarX) {
      const observer = new ResizeObserver(() => {
        const h = scrollbarX.offsetHeight;
        context.onCornerHeightChange(h);
        setHeight(h);
      });
      observer.observe(scrollbarX);
      onCleanup(() => observer.disconnect());
    }
  });

  createEffect(() => {
    const scrollbarY = context.scrollbarY;
    if (scrollbarY) {
      const observer = new ResizeObserver(() => {
        const w = scrollbarY.offsetWidth;
        context.onCornerWidthChange(w);
        setWidth(w);
      });
      observer.observe(scrollbarY);
      onCleanup(() => observer.disconnect());
    }
  });

  return (
    <Show when={hasSize()}>
      <Primitive.div
        {...rest}
        ref={local.ref}
        style={{
          width: `${width()}px`,
          height: `${height()}px`,
          position: 'absolute',
          right: context.dir === 'ltr' ? '0' : undefined,
          left: context.dir === 'rtl' ? '0' : undefined,
          bottom: '0',
          ...(typeof local.style === 'object' ? local.style : {}),
        }}
      />
    </Show>
  );
}

ScrollAreaCorner.displayName = CORNER_NAME;

/* -------------------------------------------------------------------------------------------------
 * Utility functions
 * -----------------------------------------------------------------------------------------------*/

function toInt(value: string | undefined): number {
  return value ? parseInt(value, 10) : 0;
}

function getThumbRatio(viewportSize: number, contentSize: number): number {
  const ratio = viewportSize / contentSize;
  return isNaN(ratio) ? 0 : ratio;
}

function getThumbSize(sizes: Sizes): number {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  return Math.max(thumbSize, 18); // minimum 18px
}

function getThumbOffsetFromScroll(scrollPos: number, sizes: Sizes, dir: Direction = 'ltr'): number {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange = dir === 'ltr' ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange as [number, number]);
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}

function linearScale(input: readonly [number, number], output: readonly [number, number]) {
  return (value: number) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = ScrollArea;
const Viewport = ScrollAreaViewport;
const Scrollbar = ScrollAreaScrollbar;
const Thumb = ScrollAreaThumb;
const Corner = ScrollAreaCorner;

export {
  createScrollAreaScope,
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
  Root,
  Viewport,
  Scrollbar,
  Thumb,
  Corner,
};
export type {
  ScrollAreaProps,
  ScrollAreaViewportProps,
  ScrollAreaScrollbarProps,
  ScrollAreaThumbProps,
  ScrollAreaCornerProps,
};
