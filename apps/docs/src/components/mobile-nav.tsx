import { Link, useLocation } from '@tanstack/solid-router';
import { createSignal, For, Show, splitProps } from 'solid-js';
import { cn } from '~/lib/utils';
import { siteConfig } from '~/lib/config';
import { Icons } from '~/components/icons';
import { components } from '~/lib/components';

interface MobileNavProps {
  class?: string;
}

export function MobileNav(props: MobileNavProps) {
  const [local] = splitProps(props, ['class']);
  const [open, setOpen] = createSignal(false);
  const location = useLocation();

  const close = () => setOpen(false);

  return (
    <div class={cn('flex', local.class)}>
      {/* Hamburger / Close toggle */}
      <button
        class="group relative inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setOpen(!open())}
        aria-label="메뉴 토글"
      >
        <svg
          class="size-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <Show
            when={open()}
            fallback={
              <>
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </>
            }
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </Show>
        </svg>
      </button>

      {/* Overlay + Panel */}
      <Show when={open()}>
        <div class="fixed inset-0 top-(--header-height) z-50" onClick={close}>
          <div class="fixed inset-0 top-(--header-height) bg-background/80 backdrop-blur-sm" />
          <div
            class="fixed inset-y-0 left-0 top-(--header-height) w-72 border-r bg-background p-6 shadow-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo */}
            <Link to="/" class="flex items-center gap-2 pb-6" onClick={close}>
              <Icons.logo class="size-5" />
              <span class="font-bold">{siteConfig.name}</span>
            </Link>

            {/* Menu */}
            <div class="flex flex-col gap-3 text-sm">
              <For each={siteConfig.navItems}>
                {(item) => (
                  <a
                    href={item.href}
                    class={cn(
                      'transition-colors hover:text-foreground',
                      location().pathname === item.href
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground',
                    )}
                    onClick={close}
                  >
                    {item.label}
                  </a>
                )}
              </For>
            </div>

            {/* Components */}
            <div class="mt-6 border-t pt-4">
              <h4 class="mb-2 text-sm font-semibold">Components</h4>
              <div class="flex flex-col gap-1 text-sm">
                <For each={components}>
                  {(component) => (
                    <Link
                      to="/docs/$slug"
                      params={{ slug: component.slug }}
                      class={cn(
                        'rounded-md px-2 py-1 transition-colors hover:bg-accent',
                        location().pathname === `/docs/${component.slug}`
                          ? 'font-medium text-foreground bg-accent'
                          : 'text-muted-foreground',
                      )}
                      onClick={close}
                    >
                      {component.name}
                    </Link>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
