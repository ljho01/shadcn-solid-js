import type { JSX } from 'solid-js';
import { splitProps } from 'solid-js';
import { cn } from '~/lib/utils';

export function PageNav(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class', 'children']);
  return (
    <div class={cn('container-wrapper scroll-mt-24', local.class)} {...rest}>
      <div class="container flex items-center justify-between gap-4 py-4">
        {local.children}
      </div>
    </div>
  );
}
