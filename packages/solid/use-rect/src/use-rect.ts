import { createSignal, createEffect, onCleanup } from 'solid-js';
import { observeElementRect, type Measurable } from '@radix-solid-js/rect';

/**
 * Tracks an element's bounding rect (getBoundingClientRect) over time.
 * SolidJS equivalent of React's useRect.
 *
 * @param measurable - Accessor returning the element to observe (or null)
 * @returns Accessor returning the element's DOMRect, or undefined
 */
function createElementRect(measurable: () => Measurable | null) {
  const [rect, setRect] = createSignal<DOMRect | undefined>(undefined);

  createEffect(() => {
    const element = measurable();
    if (element) {
      const unobserve = observeElementRect(element, setRect);
      onCleanup(() => {
        setRect(undefined);
        unobserve();
      });
    }
  });

  return rect;
}

export { createElementRect };
