import { type JSX, splitProps } from 'solid-js';
import { Primitive } from '@radix-solid-js/primitive-component';

const VISUALLY_HIDDEN_STYLES: JSX.CSSProperties = {
  position: 'absolute',
  border: '0',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  'white-space': 'nowrap',
  'word-wrap': 'normal',
};

interface VisuallyHiddenProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  ref?: (el: HTMLSpanElement) => void;
}

function VisuallyHidden(props: VisuallyHiddenProps) {
  const [local, rest] = splitProps(props, ['style']);
  return (
    <Primitive.span
      {...rest}
      style={{ ...VISUALLY_HIDDEN_STYLES, ...(typeof local.style === 'object' ? local.style : {}) }}
    />
  );
}

export { VisuallyHidden, VISUALLY_HIDDEN_STYLES };
export type { VisuallyHiddenProps };
