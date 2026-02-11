import { createFileRoute, Link } from '@tanstack/solid-router';
import { For } from 'solid-js';
import { components } from '~/lib/components';

export const Route = createFileRoute('/docs/components')({
  component: ComponentsPage,
});

function ComponentsPage() {
  // Sort components alphabetically by name
  const sorted = () => [...components].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div class="space-y-10">
      {/* Breadcrumb */}
      <div class="flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" class="hover:text-foreground transition-colors">Docs</Link>
        <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        <span class="text-foreground font-medium">Components</span>
      </div>

      {/* Title */}
      <div class="space-y-2">
        <h1 class="scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl">
          Components
        </h1>
        <p class="text-lg text-muted-foreground">
          사용 가능한 모든 컴포넌트 목록입니다. 더 많은 컴포넌트를 계속 추가하고 있습니다.
        </p>
      </div>

      {/* Component Grid */}
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          <For each={sorted()}>
            {(comp) => (
              <Link
                to="/docs/$slug"
                params={{ slug: comp.slug }}
                class="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                {comp.name}
              </Link>
            )}
          </For>
        </div>

        <div class="my-6 h-px bg-border" />

        <p class="text-sm text-muted-foreground">
          원하는 컴포넌트를 찾지 못하셨나요? 사이드바에서 카테고리별로 탐색해보세요.
        </p>
      </div>

      {/* Next Navigation */}
      <div class="flex items-center justify-end border-t pt-6">
        <Link
          to="/docs/$slug"
          params={{ slug: 'accordion' }}
          class="group inline-flex items-center gap-2 text-sm"
        >
          <span class="font-medium group-hover:underline">Accordion</span>
          <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </Link>
      </div>
    </div>
  );
}
