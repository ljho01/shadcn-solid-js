import { createSignal, createEffect, onCleanup } from 'solid-js';

/**
 * Tracks an element's size using ResizeObserver.
 * SolidJS equivalent of React's useSize.
 *
 * @param element - Accessor returning the element to observe (or null)
 * @returns Accessor returning the element's size, or undefined if not available
 */
function createElementSize(element: () => HTMLElement | null | undefined) {
  const [size, setSize] = createSignal<{ width: number; height: number } | undefined>(undefined);

  createEffect(() => {
    const el = element();
    if (el) {
      // Provide size as early as possible
      setSize({ width: el.offsetWidth, height: el.offsetHeight });

      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries) || !entries.length) return;

        const entry = entries[0]!;
        let width: number;
        let height: number;

        if ('borderBoxSize' in entry) {
          const borderSizeEntry = entry['borderBoxSize'];
          const borderSize = Array.isArray(borderSizeEntry)
            ? borderSizeEntry[0]
            : borderSizeEntry;
          width = borderSize['inlineSize'];
          height = borderSize['blockSize'];
        } else {
          width = el.offsetWidth;
          height = el.offsetHeight;
        }

        setSize({ width, height });
      });

      resizeObserver.observe(el, { box: 'border-box' });

      onCleanup(() => resizeObserver.unobserve(el));
    } else {
      setSize(undefined);
    }
  });

  return size;
}

export { createElementSize };
