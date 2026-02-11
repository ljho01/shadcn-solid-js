import { type JSX, splitProps } from 'solid-js';
import { Primitive, type PrimitiveProps } from '@radix-solid-js/primitive-component';

/* -------------------------------------------------------------------------------------------------
 * Label
 * -----------------------------------------------------------------------------------------------*/

interface LabelProps extends PrimitiveProps<'label'> {}

function Label(props: LabelProps) {
  const [local, rest] = splitProps(props, ['onMouseDown']);

  const handleMouseDown: JSX.EventHandler<HTMLLabelElement, MouseEvent> = (event) => {
    // only prevent text selection if clicking inside the label itself
    const target = event.target as HTMLElement;
    if (target.closest('button, input, select, textarea')) return;

    if (typeof local.onMouseDown === 'function') {
      local.onMouseDown(event);
    }

    // prevent text selection when double clicking label
    if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
  };

  return <Primitive.label {...rest} onMouseDown={handleMouseDown} />;
}

/* -----------------------------------------------------------------------------------------------*/

const Root = Label;

export { Label, Root };
export type { LabelProps };
