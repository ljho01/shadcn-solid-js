/// <reference types="vite/client" />
import { Suspense } from 'solid-js';
import type { JSX } from 'solid-js';
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/solid-router';
import { HydrationScript } from 'solid-js/web';
import { SiteHeader } from '~/components/site-header';
import { SiteFooter } from '~/components/site-footer';
import { META_THEME_COLORS } from '~/lib/config';
import appCss from '~/styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'shadcn-solid — SolidJS UI Components' },
      {
        name: 'description',
        content:
          'Radix 프리미티브와 Tailwind CSS로 만든 아름다운 SolidJS 컴포넌트. 커스터마이즈하고, 확장하고, 직접 빌드하세요.',
      },
      { name: 'theme-color', content: META_THEME_COLORS.light },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
    scripts: [
      {
        children: `
          try {
            if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
              document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}');
            }
          } catch (_) {}
        `,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument(props: Readonly<{ children: JSX.Element }>) {
  return (
    <html lang="ko" class="scroll-smooth">
      <head>
        <HeadContent />
        <HydrationScript />
      </head>
      <body class="group/body overscroll-none font-sans antialiased [--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)] xl:[--footer-height:calc(var(--spacing)*24)]">

        <div
          data-slot="layout"
          class="bg-background relative z-10 flex min-h-svh flex-col"
        >
          <SiteHeader />
          <main class="flex flex-1 flex-col">
            <Suspense>{props.children}</Suspense>
          </main>
          <SiteFooter />
        </div>

        <Scripts />
      </body>
    </html>
  );
}
