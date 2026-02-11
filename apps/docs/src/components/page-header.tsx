import type { JSX } from 'solid-js';
import { splitProps } from 'solid-js';
import { cn } from '~/lib/utils';

export function PageHeader(props: JSX.HTMLAttributes<HTMLElement>) {
  const [local, rest] = splitProps(props, ['class', 'children']);
  return (
    <section class={cn('border-grid', local.class)} {...rest}>
      <div class="container-wrapper">
        <div class="container flex flex-col items-center gap-2 px-6 py-8 text-center md:py-16 lg:py-20 xl:gap-4">
          {local.children}
        </div>
      </div>
    </section>
  );
}

export function PageHeaderHeading(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const [local, rest] = splitProps(props, ['class']);
  return (
    <h1
      class={cn(
        'text-primary leading-tighter max-w-3xl text-3xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter',
        local.class,
      )}
      {...rest}
    />
  );
}

export function PageHeaderDescription(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  const [local, rest] = splitProps(props, ['class']);
  return (
    <p
      class={cn(
        'text-foreground max-w-4xl text-base text-balance sm:text-lg',
        local.class,
      )}
      {...rest}
    />
  );
}

export function PageActions(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class']);
  return (
    <div
      class={cn(
        'flex w-full items-center justify-center gap-2 pt-2 **:data-[slot=button]:shadow-none',
        local.class,
      )}
      {...rest}
    />
  );
}
