export const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}

export function getOwnerWindow(element: Node | null | undefined) {
  if (!canUseDOM) {
    throw new Error('Cannot access window outside of the DOM');
  }
  return element?.ownerDocument?.defaultView ?? window;
}

export function getOwnerDocument(element: Node | null | undefined) {
  if (!canUseDOM) {
    throw new Error('Cannot access document outside of the DOM');
  }
  return element?.ownerDocument ?? document;
}

/**
 * Get the active element in the document, optionally following aria-activedescendant.
 * Lifted from https://github.com/ariakit/ariakit
 */
export function getActiveElement(
  node: Node | null | undefined,
  activeDescendant = false
): HTMLElement | null {
  const { activeElement } = getOwnerDocument(node);
  if (!activeElement?.nodeName) {
    return null;
  }

  if (isFrame(activeElement) && activeElement.contentDocument) {
    return getActiveElement(activeElement.contentDocument.body, activeDescendant);
  }

  if (activeDescendant) {
    const id = activeElement.getAttribute('aria-activedescendant');
    if (id) {
      const element = getOwnerDocument(activeElement).getElementById(id);
      if (element) {
        return element;
      }
    }
  }

  return activeElement as HTMLElement | null;
}

export function isFrame(element: Element): element is HTMLIFrameElement {
  return element.tagName === 'IFRAME';
}
