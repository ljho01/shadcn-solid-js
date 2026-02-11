import { For } from 'solid-js';
import { Link, useLocation } from '@tanstack/solid-router';
import { cn } from '~/lib/utils';
import { components, categories } from '~/lib/components';

export function SidebarNav() {
  const location = useLocation();

  return (
    <div class="w-full">
      {/* Sections */}
      <div class="pb-4">
        <h4 class="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
          Getting Started
        </h4>
        <div class="grid grid-flow-row auto-rows-max text-sm">
          <Link
            to="/"
            class={cn(
              'group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
              location().pathname === '/'
                ? 'font-medium text-foreground'
                : 'text-muted-foreground'
            )}
          >
            Introduction
          </Link>
          <Link
            to="/docs/components"
            class={cn(
              'group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
              location().pathname === '/docs/components'
                ? 'font-medium text-foreground'
                : 'text-muted-foreground'
            )}
          >
            Components
          </Link>
        </div>
      </div>

      {/* Components by category */}
      <div class="pb-4">
        <h4 class="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
          Components
        </h4>
        <div class="grid grid-flow-row auto-rows-max text-sm">
          <For each={components}>
            {(component) => (
              <Link
                to="/docs/$slug"
                params={{ slug: component.slug }}
                class={cn(
                  'group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                  location().pathname === `/docs/${component.slug}`
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {component.name}
              </Link>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
