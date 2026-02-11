import { splitProps } from 'solid-js';
import { Primitive, type PrimitiveProps } from '@radix-solid/primitive-component';

/* -------------------------------------------------------------------------------------------------
 * Separator
 * -----------------------------------------------------------------------------------------------*/

const DEFAULT_ORIENTATION = 'horizontal';
const ORIENTATIONS = ['horizontal', 'vertical'] as const;

type Orientation = (typeof ORIENTATIONS)[number];

interface SeparatorProps extends PrimitiveProps<'div'> {
  /**
   * Either `vertical` or `horizontal`. Defaults to `horizontal`.
   */
  orientation?: Orientation;
  /**
   * Whether or not the component is purely decorative. When true, accessibility-related attributes
   * are updated so that the rendered element is removed from the accessibility tree.
   */
  decorative?: boolean;
}

function Separator(props: SeparatorProps) {
  const [local, rest] = splitProps(props, ['decorative', 'orientation']);

  const orientation = () => {
    const o = local.orientation ?? DEFAULT_ORIENTATION;
    return isValidOrientation(o) ? o : DEFAULT_ORIENTATION;
  };

  // `aria-orientation` defaults to `horizontal` so we only need it if `orientation` is vertical
  const ariaOrientation = () =>
    orientation() === 'vertical' ? ('vertical' as const) : undefined;

  const semanticProps = () =>
    local.decorative
      ? { role: 'none' as const }
      : { 'aria-orientation': ariaOrientation(), role: 'separator' as const };

  return (
    <Primitive.div
      data-orientation={orientation()}
      {...semanticProps()}
      {...rest}
    />
  );
}

/* -----------------------------------------------------------------------------------------------*/

function isValidOrientation(orientation: any): orientation is Orientation {
  return ORIENTATIONS.includes(orientation);
}

const Root = Separator;

export { Separator, Root };
export type { SeparatorProps };
