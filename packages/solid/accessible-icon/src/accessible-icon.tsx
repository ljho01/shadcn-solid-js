import { type JSX, children as resolveChildren } from 'solid-js';
import { VisuallyHidden } from '@radix-solid/visually-hidden';

/* -------------------------------------------------------------------------------------------------
 * AccessibleIcon
 * -----------------------------------------------------------------------------------------------*/

interface AccessibleIconProps {
  children: JSX.Element;
  /**
   * The accessible label for the icon. This label will be visually hidden but announced to screen
   * reader users, similar to `alt` text for `img` tags.
   */
  label: string;
}

/**
 * Makes an icon accessible by hiding it from the accessibility tree
 * and providing a visually hidden label for screen readers.
 *
 * In React's Radix, this used `React.Children.only` + `cloneElement`.
 * In SolidJS, we use the `children()` helper and set attributes directly
 * on the resolved child element.
 */
function AccessibleIcon(props: AccessibleIconProps) {
  const resolved = resolveChildren(() => props.children);

  return (
    <>
      {(() => {
        const child = resolved() as Element;
        if (child instanceof Element) {
          child.setAttribute('aria-hidden', 'true');
          child.setAttribute('focusable', 'false');
        }
        return child;
      })()}
      <VisuallyHidden>{props.label}</VisuallyHidden>
    </>
  );
}

/* -----------------------------------------------------------------------------------------------*/

const Root = AccessibleIcon;

export { AccessibleIcon, Root };
export type { AccessibleIconProps };
