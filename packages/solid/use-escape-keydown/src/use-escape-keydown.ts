import { onMount, onCleanup } from 'solid-js';

/**
 * Listens for when the escape key is pressed.
 * SolidJS equivalent of React's useEscapeKeydown.
 * Uses onMount/onCleanup for lifecycle management.
 *
 * @param onEscapeKeyDown - Callback when Escape is pressed
 * @param ownerDocument - Document to listen on (defaults to globalThis.document)
 */
function createEscapeKeydown(
  onEscapeKeyDown?: (event: KeyboardEvent) => void,
  ownerDocument: Document = globalThis?.document
) {
  onMount(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscapeKeyDown?.(event);
      }
    };
    ownerDocument.addEventListener('keydown', handleKeyDown, { capture: true });

    onCleanup(() => {
      ownerDocument.removeEventListener('keydown', handleKeyDown, { capture: true });
    });
  });
}

export { createEscapeKeydown };
