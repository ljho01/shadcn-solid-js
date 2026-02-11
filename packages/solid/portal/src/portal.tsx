import { type JSX, createSignal, onMount, Show } from 'solid-js';
import { Portal as SolidPortal } from 'solid-js/web';

interface PortalProps {
  children: JSX.Element;
  /**
   * An optional container where the portaled content should be appended.
   * Defaults to document.body.
   */
  container?: Element | DocumentFragment | null;
}

/**
 * Portal component - wraps SolidJS's built-in Portal.
 * Provides a `container` prop for specifying the mount target,
 * matching the Radix UI Portal API.
 */
function Portal(props: PortalProps) {
  const [mounted, setMounted] = createSignal(false);

  onMount(() => setMounted(true));

  return (
    <Show when={mounted()}>
      <SolidPortal mount={props.container || document.body}>
        {props.children}
      </SolidPortal>
    </Show>
  );
}

export { Portal };
export type { PortalProps };
