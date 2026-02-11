import { splitProps } from 'solid-js';
import { Primitive, type PrimitiveProps } from '@radix-solid/primitive-component';

/* -------------------------------------------------------------------------------------------------
 * AspectRatio
 * -----------------------------------------------------------------------------------------------*/

interface AspectRatioProps extends PrimitiveProps<'div'> {
  ratio?: number;
}

function AspectRatio(props: AspectRatioProps) {
  const [local, rest] = splitProps(props, ['ratio', 'style']);

  const ratio = () => local.ratio ?? 1;

  return (
    <div
      style={{
        // ensures inner element is contained
        position: 'relative',
        // ensures padding bottom trick maths works
        width: '100%',
        'padding-bottom': `${100 / ratio()}%`,
      }}
      data-radix-aspect-ratio-wrapper=""
    >
      <Primitive.div
        {...rest}
        style={{
          ...(typeof local.style === 'object' ? local.style : {}),
          // ensures children expand in ratio
          position: 'absolute',
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        }}
      />
    </div>
  );
}

/* -----------------------------------------------------------------------------------------------*/

const Root = AspectRatio;

export { AspectRatio, Root };
export type { AspectRatioProps };
