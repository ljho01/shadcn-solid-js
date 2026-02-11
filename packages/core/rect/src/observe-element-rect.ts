// Adapted from https://github.com/reach/observe-rect/tree
// MIT license, React Training

type Measurable = { getBoundingClientRect(): DOMRect };

/**
 * Observes an element's rectangle on screen (getBoundingClientRect)
 * This is useful to track elements on the screen and attach other elements
 * that might be in different layers, etc.
 */
function observeElementRect(
  /** The element whose rect to observe */
  elementToObserve: Measurable,
  /** The callback which will be called when the rect changes */
  callback: CallbackFn
) {
  const observedData = observedElements.get(elementToObserve);

  if (observedData === undefined) {
    observedElements.set(elementToObserve, {
      rect: {} as DOMRect,
      callbacks: [callback],
    });

    if (observedElements.size === 1) {
      rafId = requestAnimationFrame(runLoop);
    }
  } else {
    observedData.callbacks.push(callback);
    callback(elementToObserve.getBoundingClientRect());
  }

  return () => {
    const observedData = observedElements.get(elementToObserve);
    if (observedData === undefined) return;

    const index = observedData.callbacks.indexOf(callback);
    if (index > -1) {
      observedData.callbacks.splice(index, 1);
    }

    if (observedData.callbacks.length === 0) {
      observedElements.delete(elementToObserve);

      if (observedElements.size === 0) {
        cancelAnimationFrame(rafId);
      }
    }
  };
}

// ========================================================================
// module internals

type CallbackFn = (rect: DOMRect) => void;

type ObservedData = {
  rect: DOMRect;
  callbacks: Array<CallbackFn>;
};

let rafId: number;
const observedElements: Map<Measurable, ObservedData> = new Map();

function runLoop() {
  const changedRectsData: Array<ObservedData> = [];

  observedElements.forEach((data, element) => {
    const newRect = element.getBoundingClientRect();

    if (!rectEquals(data.rect, newRect)) {
      data.rect = newRect;
      changedRectsData.push(data);
    }
  });

  changedRectsData.forEach((data) => {
    data.callbacks.forEach((callback) => callback(data.rect));
  });

  rafId = requestAnimationFrame(runLoop);
}

function rectEquals(rect1: DOMRect, rect2: DOMRect) {
  return (
    rect1.width === rect2.width &&
    rect1.height === rect2.height &&
    rect1.top === rect2.top &&
    rect1.right === rect2.right &&
    rect1.bottom === rect2.bottom &&
    rect1.left === rect2.left
  );
}

export { observeElementRect };
export type { Measurable };
