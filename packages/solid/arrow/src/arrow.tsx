import { type JSX, splitProps, mergeProps } from 'solid-js';
import { Primitive } from '@radix-solid/primitive-component';

interface ArrowProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  ref?: (el: SVGSVGElement) => void;
  asChild?: boolean;
}

const defaultProps = {
  width: 10,
  height: 5,
};

function Arrow(inProps: ArrowProps) {
  const props = mergeProps(defaultProps, inProps);
  const [local, rest] = splitProps(props, ['children', 'width', 'height', 'asChild']);

  return (
    <Primitive.svg
      {...(rest as any)}
      width={local.width}
      height={local.height}
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
      asChild={local.asChild}
    >
      {local.asChild ? local.children : <polygon points="0,0 30,0 15,10" />}
    </Primitive.svg>
  );
}

export { Arrow };
export type { ArrowProps };
