import { useLocation } from '@tanstack/solid-router';
import { For, splitProps } from 'solid-js';
import { cn } from '~/lib/utils';

interface MainNavProps {
  items: { href: string; label: string }[];
  class?: string;
}

export function MainNav(props: MainNavProps) {
  const [local, rest] = splitProps(props, ['items', 'class']);
  const location = useLocation();

  return (
    <nav class={cn('items-center gap-0', local.class)}>
      <For each={local.items}>
        {(item) => (
          <a
            href={item.href}
            data-active={
              location().pathname === item.href || location().pathname.startsWith(item.href + '/')
            }
            class="text-muted-foreground data-[active=true]:text-foreground relative inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {item.label}
          </a>
        )}
      </For>
    </nav>
  );
}
