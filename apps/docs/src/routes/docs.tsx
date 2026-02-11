import { createFileRoute, Outlet } from '@tanstack/solid-router';
import { Suspense } from 'solid-js';
import { SidebarNav } from '~/components/sidebar-nav';

export const Route = createFileRoute('/docs')({
  component: DocsLayout,
});

function DocsLayout() {
  return (
    <div class="container-wrapper">
      <div class="container">
        <div class="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          {/* Desktop Sidebar */}
          <aside class="fixed top-(--header-height) z-30 hidden h-[calc(100vh-var(--header-height))] w-full shrink-0 overflow-y-auto border-r py-6 pr-2 md:sticky md:block lg:py-8">
            <SidebarNav />
          </aside>

          {/* Main Content */}
          <div class="relative py-6 lg:gap-10 lg:py-8">
            <div class="mx-auto w-full min-w-0 max-w-3xl">
              <Suspense>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
