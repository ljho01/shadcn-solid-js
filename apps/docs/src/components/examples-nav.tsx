import { Link, useLocation } from '@tanstack/solid-router';
import { For, splitProps } from 'solid-js';
import { cn } from '~/lib/utils';

const examples = [
  { name: 'Button', href: '/docs/button', slug: 'button', hidden: false },
  { name: 'Card', href: '/docs/card', slug: 'card', hidden: false },
  { name: 'Dialog', href: '/docs/dialog', slug: 'dialog', hidden: false },
  { name: 'Accordion', href: '/docs/accordion', slug: 'accordion', hidden: false },
  { name: 'Tabs', href: '/docs/tabs', slug: 'tabs', hidden: false },
];

export function ExamplesNav(props: { class?: string } & Record<string, any>) {
  const [local, rest] = splitProps(props, ['class']);
  const location = useLocation();

  return (
    <div class={cn('flex items-center', local.class)} {...rest}>
      <div class="no-scrollbar max-w-[96%] overflow-x-auto md:max-w-[600px] lg:max-w-none">
        <div class="flex items-center">
          <Link
            to="/"
            class="text-muted-foreground hover:text-primary data-[active=true]:text-primary flex h-7 items-center justify-center gap-2 px-4 text-center text-base font-medium transition-colors"
            data-active={location().pathname === '/'}
          >
            Examples
          </Link>
          <For each={examples}>
            {(example) => (
              <Link
                to="/docs/$slug"
                params={{ slug: example.slug }}
                class="text-muted-foreground hover:text-primary data-[active=true]:text-primary flex h-7 items-center justify-center gap-2 px-4 text-center text-base font-medium transition-colors"
                data-active={location().pathname === example.href}
              >
                {example.name}
              </Link>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
