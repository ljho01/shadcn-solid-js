import {
  type JSX,
  Show,
  createSignal,
  createEffect,
  on,
  onCleanup,
  createContext,
  useContext,
} from 'solid-js';

/* -------------------------------------------------------------------------------------------------
 * Presence Context
 *
 * Allows animated elements (e.g., PopperContent) to register their DOM node
 * with the nearest Presence ancestor. This enables Presence to detect CSS
 * exit animations and delay unmounting until they complete.
 * -----------------------------------------------------------------------------------------------*/

interface PresenceContextValue {
  /** Register the animated DOM element with this Presence instance */
  registerNode: (el: HTMLElement) => void;
}

const PresenceContext = createContext<PresenceContextValue>();

function usePresenceContext() {
  return useContext(PresenceContext);
}

/* -------------------------------------------------------------------------------------------------
 * Presence
 *
 * Controls mount/unmount of children with CSS animation awareness.
 *
 * When `present` is true → mount children immediately.
 * When `present` becomes false:
 *   - If a registered node has a CSS exit animation → keep mounted until animationend
 *   - Otherwise → unmount immediately
 *
 * This is the SolidJS port of @radix-ui/react-presence, using the same
 * animation detection strategy (comparing animationName before/after present change).
 * -----------------------------------------------------------------------------------------------*/

interface PresenceProps {
  children: JSX.Element;
  present: boolean;
}

function getAnimationName(styles: CSSStyleDeclaration | null) {
  return styles?.animationName || 'none';
}

function Presence(props: PresenceProps) {
  const [isPresent, setIsPresent] = createSignal(props.present);

  // Node tracking
  let nodeRef: HTMLElement | null = null;
  // getComputedStyle() returns a LIVE CSSStyleDeclaration that auto-updates
  let stylesRef: CSSStyleDeclaration | null = null;
  let prevAnimationNameRef = 'none';
  let cleanupRef: (() => void) | null = null;

  const doCleanup = () => {
    cleanupRef?.();
    cleanupRef = null;
  };

  // React to `present` changes (defer: true = skip initial run)
  createEffect(
    on(
      () => props.present,
      (present) => {
        doCleanup();

        if (present) {
          // ─── MOUNT ───
          setIsPresent(true);
        } else {
          // ─── START EXIT SEQUENCE ───
          // Defer check so that data-state attributes and CSS rules
          // have been applied before we inspect computed styles.
          queueMicrotask(() => {
            // If re-opened while waiting, abort exit
            if (props.present) return;

            const styles = stylesRef;
            const currentAnimationName = getAnimationName(styles);

            if (currentAnimationName === 'none' || styles?.display === 'none') {
              // No exit animation — unmount immediately
              setIsPresent(false);
              return;
            }

            const isAnimating = prevAnimationNameRef !== currentAnimationName;

            if (isAnimating && nodeRef) {
              // Exit animation detected — wait for it to complete
              const node = nodeRef;

              const handleAnimationEnd = (event: AnimationEvent) => {
                const currentName = getAnimationName(stylesRef);
                const isCurrentAnimation = currentName.includes(
                  CSS.escape(event.animationName)
                );
                if (event.target === node && isCurrentAnimation) {
                  // Keep last-keyframe styles visible to prevent flash before unmount
                  const currentFillMode = node.style.animationFillMode;
                  node.style.animationFillMode = 'forwards';
                  setIsPresent(false);

                  // Reset fill mode after the node has had time to unmount
                  const ownerWindow =
                    node.ownerDocument.defaultView ?? window;
                  ownerWindow.setTimeout(() => {
                    if (node.style.animationFillMode === 'forwards') {
                      node.style.animationFillMode = currentFillMode;
                    }
                  });
                }
              };

              const handleAnimationStart = (event: AnimationEvent) => {
                if (event.target === node) {
                  prevAnimationNameRef = getAnimationName(stylesRef);
                }
              };

              node.addEventListener('animationend', handleAnimationEnd);
              node.addEventListener('animationcancel', handleAnimationEnd);
              node.addEventListener('animationstart', handleAnimationStart);

              cleanupRef = () => {
                node.removeEventListener('animationend', handleAnimationEnd);
                node.removeEventListener(
                  'animationcancel',
                  handleAnimationEnd
                );
                node.removeEventListener(
                  'animationstart',
                  handleAnimationStart
                );
              };
            } else {
              // No animation change — unmount immediately
              setIsPresent(false);
            }
          });
        }
      },
      { defer: true }
    )
  );

  // Update prevAnimationName when mounted
  createEffect(() => {
    if (isPresent()) {
      queueMicrotask(() => {
        if (stylesRef && isPresent()) {
          prevAnimationNameRef = getAnimationName(stylesRef);
        }
      });
    } else {
      prevAnimationNameRef = 'none';
    }
  });

  onCleanup(doCleanup);

  const contextValue: PresenceContextValue = {
    registerNode: (el: HTMLElement) => {
      nodeRef = el;
      stylesRef = getComputedStyle(el);
      prevAnimationNameRef = getAnimationName(stylesRef);
    },
  };

  return (
    <PresenceContext.Provider value={contextValue}>
      <Show when={isPresent()}>{props.children}</Show>
    </PresenceContext.Provider>
  );
}

export { Presence, PresenceContext, usePresenceContext };
export type { PresenceProps, PresenceContextValue };
